import "NexoarCore"
import "MockUSDC"
import "FungibleTokenMetadataViews"
import "FungibleToken"
import "OptionsPricing"

transaction(strikePrice: UFix64, days: UInt64, isCall: Bool, size: UInt64, tokenSymbol: String) {
    let payment: auth(FungibleToken.Withdraw) &MockUSDC.Vault
    let accountAddress: Address

    prepare(account: auth(SaveValue, BorrowValue) &Account) {
        let vaultData = MockUSDC.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
            ?? panic("Could not resolve FTVaultData view")

        if !account.storage.check<&MockUSDC.Vault>(from: vaultData.storagePath) {
            account.storage.save(<-MockUSDC.createEmptyVault(vaultType: Type<@MockUSDC.Vault>()), to: vaultData.storagePath)
        }

        let vaultRef = account.storage.borrow<auth(FungibleToken.Withdraw) &MockUSDC.Vault>(from: vaultData.storagePath)
            ?? panic("Could not borrow reference to MockUSDC Vault")

        self.payment = vaultRef
        self.accountAddress = account.address
    }

    execute {
        let _ = NexoarCore.createOption(
            payment: self.payment,
            strikePrice: strikePrice,
            days: days,
            isCall: isCall,
            size: size,
            tokenSymbol: tokenSymbol,
            address: self.accountAddress
        )
    }
}   
