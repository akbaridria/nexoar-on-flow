import "FungibleToken"
import "MetadataViews"
import "FungibleTokenMetadataViews"

access(all) contract MockUSDC: FungibleToken {

    /// The event that is emitted when new tokens are minted
    access(all) event TokensMinted(amount: UFix64, type: String)

    /// Total supply of MockUSDC tokens in existence
    access(all) var totalSupply: UFix64

    /// Storage and Public Paths
    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath
    access(all) let ReceiverPublicPath: PublicPath
    access(all) let AdminStoragePath: StoragePath

    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return [
            Type<FungibleTokenMetadataViews.FTView>(),
            Type<FungibleTokenMetadataViews.FTDisplay>(),
            Type<FungibleTokenMetadataViews.FTVaultData>(),
            Type<FungibleTokenMetadataViews.TotalSupply>()
        ]
    }

    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        switch viewType {
            case Type<FungibleTokenMetadataViews.FTView>():
                return FungibleTokenMetadataViews.FTView(
                    ftDisplay: self.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTDisplay>()) as! FungibleTokenMetadataViews.FTDisplay?,
                    ftVaultData: self.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
                )
            case Type<FungibleTokenMetadataViews.FTDisplay>():
                let media = MetadataViews.Media(
                    file: MetadataViews.HTTPFile(
                        url: "https://example.com/mockusdc-logo.svg" // Replace with actual logo URL
                    ),
                    mediaType: "image/svg+xml"
                )
                let medias = MetadataViews.Medias([media])
                return FungibleTokenMetadataViews.FTDisplay(
                    name: "Mock USDC Token",
                    symbol: "MUSDC",
                    description: "A mock USDC token for testing on the Flow blockchain.",
                    externalURL: MetadataViews.ExternalURL("https://example.com/mockusdc"),
                    logos: medias,
                    socials: {
                        "twitter": MetadataViews.ExternalURL("https://twitter.com/mockusdc")
                    }
                )
            case Type<FungibleTokenMetadataViews.FTVaultData>():
                return FungibleTokenMetadataViews.FTVaultData(
                    storagePath: self.VaultStoragePath,
                    receiverPath: self.ReceiverPublicPath,
                    metadataPath: self.VaultPublicPath,
                    receiverLinkedType: Type<&MockUSDC.Vault>(),
                    metadataLinkedType: Type<&MockUSDC.Vault>(),
                    createEmptyVaultFunction: (fun(): @{FungibleToken.Vault} {
                        return <-MockUSDC.createEmptyVault(vaultType: Type<@MockUSDC.Vault>())
                    })
                )
            case Type<FungibleTokenMetadataViews.TotalSupply>():
                return FungibleTokenMetadataViews.TotalSupply(
                    totalSupply: MockUSDC.totalSupply
                )
        }
        return nil
    }

    /// Vault
    /// Each user stores an instance of only the Vault in their storage
    access(all) resource Vault: FungibleToken.Vault {
        access(all) var balance: UFix64

        init(balance: UFix64) {
            self.balance = balance
        }

        access(contract) fun burnCallback() {
            if self.balance > 0.0 {
                MockUSDC.totalSupply = MockUSDC.totalSupply - self.balance
            }
            self.balance = 0.0
        }

        access(all) view fun getViews(): [Type] {
            return MockUSDC.getContractViews(resourceType: nil)
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            return MockUSDC.resolveContractView(resourceType: nil, viewType: view)
        }

        access(all) view fun getSupportedVaultTypes(): {Type: Bool} {
            let supportedTypes: {Type: Bool} = {}
            supportedTypes[self.getType()] = true
            return supportedTypes
        }

        access(all) view fun isSupportedVaultType(type: Type): Bool {
            return self.getSupportedVaultTypes()[type] ?? false
        }

        access(all) view fun isAvailableToWithdraw(amount: UFix64): Bool {
            return amount <= self.balance
        }

        access(FungibleToken.Withdraw) fun withdraw(amount: UFix64): @MockUSDC.Vault {
            self.balance = self.balance - amount
            return <-create Vault(balance: amount)
        }

        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            let vault <- from as! @MockUSDC.Vault
            self.balance = self.balance + vault.balance
            destroy vault
        }

        access(all) fun createEmptyVault(): @MockUSDC.Vault {
            return <-create Vault(balance: 0.0)
        }
    }

    /// Minter
    /// Resource object that allows public minting of new tokens.
    access(all) resource Minter {
        /// mintTokens
        /// Public function that mints new tokens, adds them to the total supply,
        /// and returns them to the calling context.
        access(all) fun mintTokens(amount: UFix64): @MockUSDC.Vault {
            pre {
                amount > 0.0: "Amount to mint must be greater than zero"
            }
            MockUSDC.totalSupply = MockUSDC.totalSupply + amount
            let vault <- create Vault(balance: amount)
            emit TokensMinted(amount: amount, type: vault.getType().identifier)
            return <-vault
        }
    }

    /// createMinter
    /// Public function that allows anyone to create a Minter resource
    access(all) fun createMinter(): @Minter {
        return <- create Minter()
    }

    access(all) fun createEmptyVault(vaultType: Type): @MockUSDC.Vault {
        return <- create Vault(balance: 0.0)
    }

    init() {
        self.totalSupply = 1000.0

        self.VaultStoragePath = /storage/mockUSDCTokenVault
        self.VaultPublicPath = /public/mockUSDCTokenVault
        self.ReceiverPublicPath = /public/mockUSDCTokenReceiver
        self.AdminStoragePath = /storage/mockUSDCAdmin

        let vault <- create Vault(balance: self.totalSupply)
        emit TokensMinted(amount: vault.balance, type: vault.getType().identifier)

        let mockUSDCCap = self.account.capabilities.storage.issue<&MockUSDC.Vault>(self.VaultStoragePath)
        self.account.capabilities.publish(mockUSDCCap, at: self.VaultPublicPath)
        let receiverCap = self.account.capabilities.storage.issue<&MockUSDC.Vault>(self.VaultStoragePath)
        self.account.capabilities.publish(receiverCap, at: self.ReceiverPublicPath)

        self.account.storage.save(<-vault, to: /storage/mockUSDCTokenVault)

        let admin <- create Minter()
        self.account.storage.save(<-admin, to: self.AdminStoragePath)
    }
}