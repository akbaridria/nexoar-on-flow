import "NexoarCoreV3"
import "MockUSDC"
import "FungibleToken"
import "FungibleTokenMetadataViews"

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
        NexoarCoreV3.removeLiquidity(amount: amount, address: self.accountAddress, recipient: self.recipient)
    }
}