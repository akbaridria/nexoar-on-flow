import "LiquidityManager"

access(all) fun main(provider: Address): UFix64 {
    return LiquidityManager.getProviderBalance(provider: provider)
}