import "LiquidityManager"

transaction(provider: Address, amount: UFix64) {
    prepare(signer: &Account) {
        LiquidityManager.removeLiquidity(provider: provider, amount: amount)
    }
}