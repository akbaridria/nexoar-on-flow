access(all) contract VaultTracker {
    // State variables
    access(all) var totalStaked: UFix64
    access(all) var accRewardPerShare: Fix64
    access(all) var lastRewardTime: UInt64
    access(all) var totalPnL: Fix64
    access(all) var providerData: {Address: ProviderData}

    // Struct for provider data
    access(all) struct ProviderData {
        access(all) var stake: UFix64
        access(all) var rewardDebt: Fix64
        access(all) var lastUpdateTime: UInt64

        init(stake: UFix64, rewardDebt: Fix64, lastUpdateTime: UInt64) {
            self.stake = stake
            self.rewardDebt = rewardDebt
            self.lastUpdateTime = lastUpdateTime
        }
    }

    // Events
    access(all) event StakeAdded(provider: Address, amount: UFix64)
    access(all) event StakeRemoved(provider: Address, amount: UFix64)
    access(all) event PnLDistributed(pnl: Fix64)

    access(self) fun updatePool() {
        if getCurrentBlock().height <= self.lastRewardTime {
            return
        }
        self.lastRewardTime = getCurrentBlock().height
    }

    access(all) fun getPendingRewards(provider: Address): Fix64 {
        if !self.providerData.containsKey(provider) || self.providerData[provider]!.stake == 0.0 {
            return 0.0
        }
        let providerData = self.providerData[provider]!
        return (Fix64(providerData.stake) * self.accRewardPerShare) - providerData.rewardDebt
    }

    access(all) fun getEffectiveBalance(provider: Address): UFix64 {
        if !self.providerData.containsKey(provider) || self.providerData[provider]!.stake == 0.0 {
            return 0.0
        }
        let providerData = self.providerData[provider]!
        let effectiveBal = Fix64(providerData.stake) + self.getPendingRewards(provider: provider)
        return effectiveBal > 0.0 ? UFix64(effectiveBal) : 0.0
    }

    // Public functions
    access(account) fun addStake(provider: Address, amount: UFix64) {
        pre {
            amount > 0.0: "Amount must be greater than zero"
        }

        // Update pool state
        self.updatePool()

        // Update provider data
        if let existingData = self.providerData[provider] {
            // Existing provider
            let newStake = existingData.stake + amount
            let newRewardDebt = existingData.rewardDebt + (Fix64(amount) * self.accRewardPerShare)
            self.providerData[provider] = ProviderData(
                stake: newStake,
                rewardDebt: newRewardDebt,
                lastUpdateTime: getCurrentBlock().height
            )
        } else {
            // New provider
            self.providerData[provider] = ProviderData(
                stake: amount,
                rewardDebt: Fix64(amount) * self.accRewardPerShare,
                lastUpdateTime: getCurrentBlock().height
            )
        }

        // Update total staked
        self.totalStaked = self.totalStaked + amount

        emit StakeAdded(provider: provider, amount: amount)
    }

    access(account) fun removeStake(provider: Address, amount: UFix64) {
        pre {
            amount > 0.0: "Amount must be greater than zero"
            self.providerData.containsKey(provider): "Provider has no stake"
        }

        // Update pool state
        self.updatePool()

        // Get provider data
        let providerData = self.providerData[provider]!
        let effectiveBalance = self.getEffectiveBalance(provider: provider)
        assert(amount <= effectiveBalance, message: "Insufficient balance")

        let pendingRewards = self.getPendingRewards(provider: provider)
        var stakeToRemove: UFix64 = 0.0
        if pendingRewards >= 0.0 {
            let positiveRewards = pendingRewards
            if amount <= UFix64(positiveRewards) {
                stakeToRemove = 0.0
            } else {
                stakeToRemove = amount - UFix64(positiveRewards)
            }
        } else {
            stakeToRemove = amount
        }

        if stakeToRemove > 0.0 {
            assert(providerData.stake >= stakeToRemove, message: "Insufficient stake")
            let newStake = providerData.stake - stakeToRemove
            let newRewardDebt = providerData.rewardDebt - (Fix64(stakeToRemove) * self.accRewardPerShare)
            self.providerData[provider] = ProviderData(
                stake: newStake,
                rewardDebt: newRewardDebt,
                lastUpdateTime: getCurrentBlock().height
            )
            self.totalStaked = self.totalStaked - stakeToRemove
        } else {
            // Update lastUpdateTime even if no stake is removed (e.g., only rewards withdrawn)
            self.providerData[provider] = ProviderData(
                stake: providerData.stake,
                rewardDebt: providerData.rewardDebt,
                lastUpdateTime: getCurrentBlock().height
            )
        }

        // If stake is zero, remove provider data
        if self.providerData[provider]!.stake == 0.0 {
            let _ = self.providerData.remove(key: provider)
        }

        emit StakeRemoved(provider: provider, amount: amount)
    }

    access(account) fun distributePnL(pnl: Fix64) {
        if self.totalStaked == 0.0 {
            return
        }

        self.updatePool()
        self.totalPnL = self.totalPnL + pnl

        if pnl != 0.0 {
            let rewardPerShare = pnl / Fix64(self.totalStaked)
            self.accRewardPerShare = self.accRewardPerShare + rewardPerShare
        }

        emit PnLDistributed(pnl: pnl)
    }

    // Read-only functions
    access(all) fun getProviderInfo(provider: Address): {String: AnyStruct} {
        if !self.providerData.containsKey(provider) {
            return {
                "stake": 0.0,
                "pendingRewards": 0.0 as Fix64,
                "effectiveBalance": 0.0,
                "lastUpdateTime": 0 as UInt64
            }
        }
        let providerData = self.providerData[provider]!
        return {
            "stake": providerData.stake,
            "pendingRewards": self.getPendingRewards(provider: provider),
            "effectiveBalance": self.getEffectiveBalance(provider: provider),
            "lastUpdateTime": providerData.lastUpdateTime
        }
    }

    access(all) fun getPoolInfo(): {String: AnyStruct} {
        return {
            "totalStaked": self.totalStaked,
            "accRewardPerShare": self.accRewardPerShare,
            "totalPnL": self.totalPnL,
            "lastRewardTime": self.lastRewardTime,
            "providerCount": self.providerData.length
        }
    }

    access(all) fun getProviderStake(provider: Address): UFix64 {
        return self.providerData[provider]?.stake ?? 0.0
    }

    access(all) fun getProviderPendingRewards(provider: Address): Fix64 {
        return self.getPendingRewards(provider: provider)
    }

    access(all) fun getProviderEffectiveBalance(provider: Address): UFix64 {
        return self.getEffectiveBalance(provider: provider)
    }

    access(all) fun getProviderLastUpdateTime(provider: Address): UInt64 {
        return self.providerData[provider]?.lastUpdateTime ?? 0
    }

    init() {
        self.totalStaked = 0.0
        self.accRewardPerShare = 0.0
        self.lastRewardTime = 0
        self.totalPnL = 0.0
        self.providerData = {}
    }
}