import FlowJson from "@/flow.json";
import { useFlowCurrentUser, useFlowMutate } from "@onflow/react-sdk";
import { useCallback } from "react";

const CREATE_OPTIONS_SCRIPT = `
import NexoarCore from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import MockUSDC from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import FungibleTokenMetadataViews from 0x${FlowJson.dependencies.FungibleTokenMetadataViews.aliases.testnet}
import FungibleToken from 0x${FlowJson.dependencies.FungibleToken.aliases.testnet}
import OptionsPricing from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import FlowTransactionScheduler from 0x${FlowJson.dependencies.FlowTransactionScheduler.aliases.testnet}
import FlowTransactionSchedulerUtils from 0x${FlowJson.dependencies.FlowTransactionSchedulerUtils.aliases.testnet}
import OptionExerciseHandler from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import FlowToken from 0x${FlowJson.dependencies.FlowToken.aliases.testnet}

transaction(
    strikePrice: UFix64,
    days: UInt64,
    isCall: Bool,
    size: UInt64,
    tokenSymbol: String,
    recipient: Address,
    priority: UInt8,
    executionEffort: UInt64
) {
    let payment: auth(FungibleToken.Withdraw) &MockUSDC.Vault
    let accountAddress: Address
    let account: auth(BorrowValue, SaveValue, IssueStorageCapabilityController, PublishCapability, GetStorageCapabilityController) &Account

    prepare(account: auth(BorrowValue, SaveValue, IssueStorageCapabilityController, PublishCapability, GetStorageCapabilityController) &Account) {
        self.account = account
        
        let vaultData = MockUSDC.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
            ?? panic("Could not resolve FTVaultData view")

        if account.storage.check<&MockUSDC.Vault>(from: vaultData.storagePath) == nil {
            account.storage.save(<-MockUSDC.createEmptyVault(vaultType: Type<@MockUSDC.Vault>()), to: vaultData.storagePath)
        }
        
        if account.storage.borrow<&AnyResource>(from: /storage/OptionExerciseHandler) == nil {
            let handler <- OptionExerciseHandler.createHandler()
            account.storage.save(<-handler, to: /storage/OptionExerciseHandler)
            let _ = account.capabilities.storage
                .issue<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>(/storage/OptionExerciseHandler)
            let publicCap = account.capabilities.storage
                .issue<&{FlowTransactionScheduler.TransactionHandler}>(/storage/OptionExerciseHandler)
            account.capabilities.publish(publicCap, at: /public/OptionExerciseHandler)
        }

        let vaultRef = account.storage.borrow<auth(FungibleToken.Withdraw) &MockUSDC.Vault>(from: vaultData.storagePath)
            ?? panic("Could not borrow reference to MockUSDC Vault")

        self.payment = vaultRef
        self.accountAddress = account.address
    }

    execute {
        
        let option = NexoarCore.createOption(
            payment: self.payment,
            strikePrice: strikePrice,
            days: days,
            isCall: isCall,
            size: size,
            tokenSymbol: tokenSymbol,
            address: self.accountAddress
        )

        let optionId = option.optionId
        let expiry = option.expiry

        
        var handlerCap: Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>? = nil
        
        if let cap = self.account.capabilities.storage
                            .getControllers(forPath: /storage/OptionExerciseHandler)[0]
                            .capability as? Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}> {
            handlerCap = cap
        } else {
            handlerCap = self.account.capabilities.storage
                            .getControllers(forPath: /storage/OptionExerciseHandler)[1]
                            .capability as! Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>
        }
        
        assert(handlerCap != nil, message: "Handler capability not found")

        
        if self.account.storage.borrow<&AnyResource>(from: FlowTransactionSchedulerUtils.managerStoragePath) == nil {
            let manager <- FlowTransactionSchedulerUtils.createManager()
            self.account.storage.save(<-manager, to: FlowTransactionSchedulerUtils.managerStoragePath)
            let managerCap = self.account.capabilities.storage.issue<&{FlowTransactionSchedulerUtils.Manager}>(FlowTransactionSchedulerUtils.managerStoragePath)
            self.account.capabilities.publish(managerCap, at: FlowTransactionSchedulerUtils.managerPublicPath)
        }
        let manager = self.account.storage.borrow<auth(FlowTransactionSchedulerUtils.Owner) &{FlowTransactionSchedulerUtils.Manager}>(from: FlowTransactionSchedulerUtils.managerStoragePath)
            ?? panic("Could not borrow a Manager reference")

        
        let data: {String: AnyStruct} = {
            "optionId": optionId,
            "recipient": recipient
        }

        
        let pr = priority == 0
            ? FlowTransactionScheduler.Priority.High
            : priority == 1
                ? FlowTransactionScheduler.Priority.Medium
                : FlowTransactionScheduler.Priority.Low

        let est = FlowTransactionScheduler.estimate(
            data: data,
            timestamp: UFix64(expiry) + 3.0, // add buffer 3 seconds
            priority: pr,
            executionEffort: executionEffort
        )
        assert(
            est.timestamp != nil || pr == FlowTransactionScheduler.Priority.Low,
            message: est.error ?? "estimation failed"
        )

        let flowVault = self.account.storage
            .borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("missing FlowToken vault")
        let fees <- flowVault.withdraw(amount: est.flowFee ?? 0.0) as! @FlowToken.Vault

        
        let scheduledId = manager.schedule(
            handlerCap: handlerCap!,
            data: data,
            timestamp: UFix64(expiry),
            priority: pr,
            executionEffort: executionEffort,
            fees: <-fees
        )
        log("Scheduled option exercise with id ".concat(scheduledId.toString()).concat(" at ").concat(expiry.toString()))
    }
}
`;

const useCreateOptions = () => {
  const { mutateAsync, isPending, error, reset } = useFlowMutate();

  const { user } = useFlowCurrentUser();

  const createOptions = useCallback(
    ({
      strikePrice,
      days,
      isCall,
      size,
      tokenSymbol,
    }: {
      strikePrice: string;
      days: number;
      isCall: boolean;
      size: number;
      tokenSymbol: string;
    }) => {
      return mutateAsync({
        cadence: CREATE_OPTIONS_SCRIPT,
        args: (args, t) => [
          args(strikePrice, t.UFix64),
          args(days, t.UInt64),
          args(isCall, t.Bool),
          args(size, t.UInt64),
          args(tokenSymbol, t.String),
          args(user?.addr || "", t.Address),
          args(1, t.UInt8),
          args(1000, t.UInt64),
        ],
      });
    },
    [user]
  );

  return {
    createOptions,
    isPending,
    error,
    reset,
  };
};

export default useCreateOptions;
