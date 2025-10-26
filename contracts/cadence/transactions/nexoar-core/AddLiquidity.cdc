import "NexoarCore"
import "MockUSDC"
import "FungibleToken"
import "FungibleTokenMetadataViews"

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