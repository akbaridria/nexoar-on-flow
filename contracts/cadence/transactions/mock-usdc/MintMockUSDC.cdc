import "FungibleToken"
import "MockUSDC"
import "FungibleTokenMetadataViews"

transaction(amount: UFix64) {
    let vaultRef: &{FungibleToken.Receiver}

    prepare(signer: auth(IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability, BorrowValue) &Account) {
        // Get vault data from metadata views
        let vaultData = MockUSDC.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
            ?? panic("Could not resolve FTVaultData view")

        // Setup vault if it doesn't exist
         if signer.storage.borrow<&MockUSDC.Vault>(from: vaultData.storagePath) == nil {
            signer.storage.save(<-MockUSDC.createEmptyVault(vaultType: Type<@MockUSDC.Vault>()), to: vaultData.storagePath)
        }

        // Publish vault capabilities if not already published
        if signer.capabilities.borrow<&{FungibleToken.Vault}>(vaultData.metadataPath) == nil {
            let vaultCap = signer.capabilities.storage.issue<&{FungibleToken.Balance, FungibleToken.Vault}>(vaultData.storagePath)
            signer.capabilities.publish(vaultCap, at: vaultData.metadataPath)
        }
        if signer.capabilities.borrow<&{FungibleToken.Receiver}>(vaultData.receiverPath) == nil {
            let receiverCap = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(vaultData.storagePath)
            signer.capabilities.publish(receiverCap, at: vaultData.receiverPath)
        }

        // Borrow the vault's Receiver capability
        self.vaultRef = signer.capabilities.borrow<&{FungibleToken.Receiver}>(vaultData.receiverPath)
            ?? panic("Could not borrow Receiver reference from path ".concat(vaultData.receiverPath.toString()))

        // Create or borrow Minter resource
        let minterStoragePath = MockUSDC.AdminStoragePath
        if signer.storage.borrow<&MockUSDC.Minter>(from: minterStoragePath) == nil {
            let minter <- MockUSDC.createMinter()
            signer.storage.save(<-minter, to: minterStoragePath)
        }

        // Borrow the Minter reference
        let minterRef = signer.storage.borrow<&MockUSDC.Minter>(from: minterStoragePath)
            ?? panic("Could not borrow Minter reference from path ".concat(minterStoragePath.toString()))

        // Mint tokens
        let vault <- minterRef.mintTokens(amount: amount)
        self.vaultRef.deposit(from: <-vault)
    }

    execute {}
}