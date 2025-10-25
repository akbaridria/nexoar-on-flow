import "LiquidityManager"

transaction(pnl: Fix64) {
    prepare(signer: &Account) {
        LiquidityManager.distributePnL(pnl: pnl)
    }
}