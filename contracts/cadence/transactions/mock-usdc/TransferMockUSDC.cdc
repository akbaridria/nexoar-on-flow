import "FungibleToken"
import "MockUSDC"
import "FungibleTokenMetadataViews"

transaction(to: Address, amount: UFix64) {
    let sourceVault: auth(FungibleToken.Withdraw) &MockUSDC.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        let vaultData = MockUSDC.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
            ?? panic("Could not resolve FTVaultData view")
        self.sourceVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &MockUSDC.Vault>(from: vaultData.storagePath)
            ?? panic("Could not borrow Vault reference")
    }

    execute {
        let recipient = getAccount(to)
        let receiverRef = recipient.capabilities.borrow<&{FungibleToken.Receiver}>(/public/mockUSDCTokenReceiver)
            ?? panic("Could not borrow Receiver reference")
        receiverRef.deposit(from: <-self.sourceVault.withdraw(amount: amount))
    }
}