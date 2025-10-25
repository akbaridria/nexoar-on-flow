import "VaultTracker"

access(all) contract LiquidityManager {
    // State variables
    access(all) var totalLiquidity: UFix64
    access(all) var lockedLiquidity: UFix64

    // Events
    access(all) event LiquidityAdded(provider: Address, amount: UFix64)
    access(all) event LiquidityRemoved(provider: Address, amount: UFix64)
    access(all) event LiquidityLocked(amount: UFix64)
    access(all) event LiquidityUnlocked(amount: UFix64)
    access(all) event PnLDistributed(pnl: Fix64)

    // Errors
    access(all) let ErrInsufficientLiquidity: String
    access(all) let ErrInvalidUnlock: String
    access(all) let ErrInvalidAmount: String

    // Public functions
    access(all) fun addLiquidity(provider: Address, amount: UFix64) {
        pre {
            amount > 0.0: self.ErrInvalidAmount
        }

        // Call VaultTracker.addStake
        VaultTracker.addStake(provider: provider, amount: amount)

        // Update total liquidity
        self.totalLiquidity = self.totalLiquidity + amount

        emit LiquidityAdded(provider: provider, amount: amount)
    }

    access(all) fun removeLiquidity(provider: Address, amount: UFix64) {
        pre {
            amount > 0.0: self.ErrInvalidAmount
        }

        // Call VaultTracker.removeStake
        VaultTracker.removeStake(provider: provider, amount: amount)

        // Verify and update total liquidity
        assert(amount <= self.totalLiquidity, message: self.ErrInsufficientLiquidity)
        self.totalLiquidity = self.totalLiquidity - amount

        emit LiquidityRemoved(provider: provider, amount: amount)
    }

    access(all) fun lockLiquidity(amount: UFix64) {
        pre {
            amount > 0.0: self.ErrInvalidAmount
            self.lockedLiquidity + amount <= self.totalLiquidity: self.ErrInsufficientLiquidity
        }

        // Update locked liquidity
        self.lockedLiquidity = self.lockedLiquidity + amount

        emit LiquidityLocked(amount: amount)
    }

    access(all) fun unlockLiquidity(amount: UFix64) {
        pre {
            amount > 0.0: self.ErrInvalidAmount
            self.lockedLiquidity >= amount: self.ErrInvalidUnlock
        }

        // Update locked liquidity
        self.lockedLiquidity = self.lockedLiquidity - amount

        emit LiquidityUnlocked(amount: amount)
    }

    access(all) fun distributePnL(pnl: Fix64) {
        // Call VaultTracker.distributePnL
        VaultTracker.distributePnL(pnl: pnl)

        // Update total liquidity based on PnL
        if pnl >= 0.0 {
            self.totalLiquidity = self.totalLiquidity + UFix64(pnl)
        } else {
            let absPnl = UFix64(-pnl)
            assert(absPnl <= self.totalLiquidity, message: self.ErrInsufficientLiquidity)
            self.totalLiquidity = self.totalLiquidity - absPnl
        }

        emit PnLDistributed(pnl: pnl)
    }

    // Read-only functions
    access(all) fun getTotalLiquidity(): UFix64 {
        return self.totalLiquidity
    }

    access(all) fun getAvailableLiquidity(): UFix64 {
        return self.totalLiquidity - self.lockedLiquidity
    }

    access(all) fun getProviderBalance(provider: Address): UFix64 {
        let info = VaultTracker.getProviderInfo(provider: provider)
        return info["effectiveBalance"]! as! UFix64
    }

    access(all) fun getUtilizationRate(): Fix64 {
        if self.totalLiquidity == 0.0 {
            return 0.0
        }
        return Fix64(self.lockedLiquidity) / Fix64(self.totalLiquidity)
    }

    init() {
        self.totalLiquidity = 0.0
        self.lockedLiquidity = 0.0
        self.ErrInsufficientLiquidity = "Insufficient liquidity"
        self.ErrInvalidUnlock = "Invalid unlock amount"
        self.ErrInvalidAmount = "Amount must be greater than zero"
    }
}