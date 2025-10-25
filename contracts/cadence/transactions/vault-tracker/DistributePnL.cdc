import "VaultTracker"

transaction(pnl: Fix64) {
    prepare(signer: &Account) {
        return VaultTracker.distributePnL(pnl: pnl)
    }
}