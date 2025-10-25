import "VaultTracker"

access(all) fun main(provider: Address): Fix64 {
    return VaultTracker.getProviderPendingRewards(provider: provider)
}