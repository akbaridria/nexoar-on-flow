import "VaultTracker"

access(all) fun main(provider: Address): UFix64 {
    return VaultTracker.getProviderStake(provider: provider)
}