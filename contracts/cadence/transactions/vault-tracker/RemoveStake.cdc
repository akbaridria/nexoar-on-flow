import "VaultTracker"

transaction(provider: Address, amount: UFix64) {
    prepare(signer: &Account) {
        VaultTracker.removeStake(provider: provider, amount: amount)
    }
}