// import "FungibleToken"
// import "MetadataViews"
// import "FungibleTokenMetadataViews"


// access(all) contract MockUSDC: FungibleToken {

//     access(all) event TokensMinted(amount: UFix64, to: Address)

//     access(all) var totalSupply: UFix64

//     access(all) let VaultStoragePath: StoragePath
//     access(all) let VaultPublicPath: PublicPath


//     access(all) view fun getContractViews(resourceType: Type?): [Type] {
//         return [
//             Type<FungibleTokenMetadataViews.FTView>(),
//             Type<FungibleTokenMetadataViews.FTDisplay>(),
//             Type<FungibleTokenMetadataViews.FTVaultData>(),
//             Type<FungibleTokenMetadataViews.TotalSupply>()
//         ]
//     }

//     access(all) resource Vault: FungibleToken.Vault {
//         access(all) var balance: UFix64

//         init(balance: UFix64) {
//             self.balance = balance
//         }

//         access(contract) fun burnCallback() {
//             if self.balance > 0.0 {
//                 MockUSDC.totalSupply = MockUSDC.totalSupply - self.balance
//             }
//             self.balance = 0.0
//         }

//         access(all) fun deposit(from: @{FungibleToken.Vault}) {
//             let vault <- from as! @MockUSDC.Vault
//             self.balance = self.balance + vault.balance
//             destroy vault
//         }

//         access(FungibleToken.Withdraw) fun withdraw(amount: UFix64): @MockUSDC.Vault {
//             pre {
//                 self.balance >= amount:
//                     "Insufficient balance"
//             }
//             self.balance = self.balance - amount
//             return <-create Vault(balance: amount)
//         }

//         access(all) fun getBalance(): UFix64 {
//             return self.balance
//         }

//         access(all) fun createEmptyVault(): @MockUSDC.Vault {
//             return <-create Vault(balance: 0.0)
//         }
//     }

//     access(all) fun createEmptyVault(): @MockUSDC.Vault {
//         return <-create Vault(balance: 0.0)
//     }

//     // Public mint function (for testing/demo)
//     access(all) fun mintTokens(amount: UFix64, recipient: Capability<&{FungibleToken.Receiver}>) {
//         let recipientRef = recipient.borrow()
//             ?? panic("Recipient vault not configured")
//         MockUSDC.totalSupply = MockUSDC.totalSupply + amount
//         recipientRef.deposit(from: <-create Vault(balance: amount))
//         emit TokensMinted(amount: amount, to: recipient.address)
//     }

//     init() {
//         self.totalSupply = 0.0
//         self.VaultStoragePath = /storage/MockUSDCVault
//         self.VaultPublicPath = /public/MockUSDCReceiver
//     }
// }