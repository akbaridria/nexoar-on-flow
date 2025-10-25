import "LiquidityManager"

access(all) fun main(): Fix64 {
    return LiquidityManager.getUtilizationRate()
}