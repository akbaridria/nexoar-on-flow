import FlowJson from "@/flow.json";
import { useFlowMutate } from "@onflow/react-sdk";
import { useCallback } from "react";

const ADD_LIQUIDITY_SCRIPT = `
import NexoarCore from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import MockUSDC from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import FungibleToken from 0x${FlowJson.dependencies.FungibleToken.aliases.testnet}
import FungibleTokenMetadataViews from 0x${FlowJson.dependencies.FungibleTokenMetadataViews.aliases.testnet}

transaction(amount: UFix64) {
    let payment: @MockUSDC.Vault
    let accountAddress: Address

    prepare(account: auth(BorrowValue, SaveValue) &Account) {
        let vaultData = MockUSDC.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
            ?? panic("Could not resolve FTVaultData view")

        let vaultRef = account.storage.borrow<auth(FungibleToken.Withdraw) &MockUSDC.Vault>(from: vaultData.storagePath)
            ?? panic("Could not borrow MockUSDC Vault reference")

        self.payment <- vaultRef.withdraw(amount: amount)
        self.accountAddress = account.address
    }

    execute {
        NexoarCore.addLiquidity(payment: <-self.payment, amount: amount, address: self.accountAddress)
    }
}
`;

const REMOVE_LIQUIDITY_SCRIPT = `
import NexoarCore from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import MockUSDC from 0x${FlowJson.accounts["nexoar-on-flow"].address}
import FungibleToken from 0x${FlowJson.dependencies.FungibleToken.aliases.testnet}
import FungibleTokenMetadataViews from 0x${FlowJson.dependencies.FungibleTokenMetadataViews.aliases.testnet}

transaction(amount: UFix64) {
    let accountAddress: Address
    let recipient: &{FungibleToken.Receiver}

    prepare(signer: auth(BorrowValue, SaveValue, PublishCapability) &Account) {
        let vaultData = MockUSDC.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
            ?? panic("Could not resolve FTVaultData view")

        self.accountAddress = signer.address

        // Borrow the receiver capability for payout
        self.recipient = signer.capabilities.borrow<&{FungibleToken.Receiver}>(vaultData.receiverPath)
            ?? panic("Could not borrow MockUSDC receiver capability")
    }

    execute {
        NexoarCore.removeLiquidity(amount: amount, address: self.accountAddress, recipient: self.recipient)
    }
}
`;

const useAddLiquidity = () => {
  const { mutateAsync, reset, isPending, data, isSuccess } = useFlowMutate();

  const addLiquidity = useCallback(async (amount: string) => {
    reset();
    return await mutateAsync({
      cadence: ADD_LIQUIDITY_SCRIPT,
      args: (arg, t) => [arg(amount, t.UFix64)],
    });
  }, []);

  return {
    addLiquidity,
    isPending,
    isSuccess,
    data,
    reset,
  };
};

const useRemoveLiquidity = () => {
  const { mutateAsync, reset, isPending, data, isSuccess } = useFlowMutate();
  const removeLiquidity = useCallback(async (amount: string) => {
    reset();
    return await mutateAsync({
      cadence: REMOVE_LIQUIDITY_SCRIPT,
      args: (arg, t) => [arg(amount, t.UFix64)],
    });
  }, []);
  return {
    removeLiquidity,
    isPending,
    isSuccess,
    data,
    reset,
  };
};

export { useAddLiquidity, useRemoveLiquidity };
