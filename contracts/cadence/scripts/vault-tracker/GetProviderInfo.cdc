import "VaultTracker"

access(all) fun main(provider: Address): {String: AnyStruct} {
    return VaultTracker.getProviderInfo(provider: provider)
}