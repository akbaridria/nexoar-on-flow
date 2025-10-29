import FlowJson from "@/flow.json";
import { useFlowCurrentUser, useFlowMutate } from "@onflow/react-sdk";
import { useCallback } from "react";

const PLACE_BET_SCRIPT = `
import Flashbet from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import MockUSDC from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import FungibleTokenMetadataViews from 0x${FlowJson.dependencies.FungibleTokenMetadataViews.aliases.testnet}
import FungibleToken from 0x${FlowJson.dependencies.FungibleToken.aliases.testnet}
import FlowTransactionScheduler from 0x${FlowJson.dependencies.FlowTransactionScheduler.aliases.testnet}
import FlowTransactionSchedulerUtils from 0x${FlowJson.dependencies.FlowTransactionSchedulerUtils.aliases.testnet}
import BetResolveHandler from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import FlowToken from 0x${FlowJson.dependencies.FlowToken.aliases.testnet}

transaction(
    duration: UInt64,
    amount: UFix64,
    baseToken: String,
    isBetUp: Bool,
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

        if account.storage.borrow<&AnyResource>(from: /storage/BetResolveHandler) == nil {
            let handler <- BetResolveHandler.createHandler()
            account.storage.save(<-handler, to: /storage/BetResolveHandler)
            let _ = account.capabilities.storage
                .issue<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>(/storage/BetResolveHandler)
            let publicCap = account.capabilities.storage
                .issue<&{FlowTransactionScheduler.TransactionHandler}>(/storage/BetResolveHandler)
            account.capabilities.publish(publicCap, at: /public/BetResolveHandler)
        }

        let vaultRef = account.storage.borrow<auth(FungibleToken.Withdraw) &MockUSDC.Vault>(from: vaultData.storagePath)
            ?? panic("Could not borrow reference to MockUSDC Vault")

        self.payment = vaultRef
        self.accountAddress = account.address
    }

    execute {
        let bet = Flashbet.placeBet(
            payment: self.payment,
            address: self.accountAddress,
            duration: duration,
            amount: amount,
            baseToken: baseToken,
            isBetUp: isBetUp
        )

        let betId = bet.betId
        let expiresAt = bet.expiresAt

        var handlerCap: Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>? = nil
        
        if let cap = self.account.capabilities.storage
                            .getControllers(forPath: /storage/BetResolveHandler)[0]
                            .capability as? Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}> {
            handlerCap = cap
        } else {
            handlerCap = self.account.capabilities.storage
                            .getControllers(forPath: /storage/BetResolveHandler)[1]
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
            "betId": betId,
            "recipient": recipient
        }

        let pr = priority == 0
            ? FlowTransactionScheduler.Priority.High
            : priority == 1
                ? FlowTransactionScheduler.Priority.Medium
                : FlowTransactionScheduler.Priority.Low

        let est = FlowTransactionScheduler.estimate(
            data: data,
            timestamp: expiresAt + 3.0, // add buffer 3 seconds
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
            timestamp: expiresAt,
            priority: pr,
            executionEffort: executionEffort,
            fees: <-fees
        )
        log("Scheduled bet resolve with id ".concat(scheduledId.toString()).concat(" at ").concat(expiresAt.toString()))
    }
}
`;

const usePlaceBet = () => {
  const { mutateAsync, reset, isPending } = useFlowMutate();
  const { user } = useFlowCurrentUser();
  const placeBet = useCallback(
    ({
      duration,
      amount,
      baseToken,
      isBetUp,
    }: {
      duration: number;
      amount: number;
      baseToken: string;
      isBetUp: boolean;
    }) => {
      return mutateAsync({
        cadence: PLACE_BET_SCRIPT,
        args: (arg, t) => [
          arg(duration, t.UInt64),
          arg(amount.toFixed(8), t.UFix64),
          arg(baseToken, t.String),
          arg(isBetUp, t.Bool),
          arg(user?.addr || "", t.Address),
          arg(1, t.UInt8),
          arg(1000, t.UInt64),
        ],
      });
    },
    [user]
  );
  return {
    placeBet,
    reset,
    isPending,
  };
};

export default usePlaceBet;
