import "VaultTracker"

access(all) fun main(): {String: AnyStruct} {
    return VaultTracker.getPoolInfo()
}