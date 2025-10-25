import "LiquidityManager"

transaction(provider: Address, amount: UFix64) {
    prepare(signer: &Account) {
        LiquidityManager.addLiquidity(provider: provider, amount: amount)
    }
}