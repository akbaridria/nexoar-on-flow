import "LiquidityManager"

transaction(amount: UFix64) {
    prepare(signer: &Account) {
        LiquidityManager.unlockLiquidity(amount: amount)
    }
}