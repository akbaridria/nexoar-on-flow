import "VaultTracker"

transaction(provider: Address, amount: UFix64) {
    prepare(signer: &Account) {
        VaultTracker.addStake(provider: provider, amount: amount)
    }
}