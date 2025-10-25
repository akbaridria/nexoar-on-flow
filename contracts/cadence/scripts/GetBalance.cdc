import "FungibleToken"
import "MockUSDC"
import "FungibleTokenMetadataViews"

access(all) fun main(address: Address): UFix64 {
    let vaultData = MockUSDC.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
        ?? panic("Could not resolve FTVaultData view")
    return getAccount(address).capabilities.borrow<&{FungibleToken.Balance}>(vaultData.metadataPath)?.balance
        ?? panic("Could not borrow Balance reference")
}