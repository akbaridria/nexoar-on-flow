import "MockUSDC"
import "FungibleToken"
import "LiquidityManager"
import "BandOracle"
import "FlowToken"

access(all)
contract Flashbet {
    // Errors
    access(all) let ErrMinDuration: String
    access(all) let ErrMaxDuration: String
    access(all) let ErrMinBetAmount: String
    access(all) let ErrMaxBetAmount: String
    access(all) let ErrBetNotFound: String
    access(all) let ErrBetIsNotExpired: String

    // data vars
    access(all) var betId: UInt64
    access(all) var winMultiplier: UFix64
    access(all) let minDuraton: UInt64
    access(all) let maxDuration: UInt64
    access(all) let minBetAmount: UFix64
    access(all) let maxBetAmount: UFix64
    access(all) let protocolFeePercent: UFix64
    access(all) var protocolRevenue: UFix64
    access(all) var userBets: {Address: [UInt64]}
    access(all) struct BetData {
        access(all) var betId: UInt64
        access(all) var bettor: Address
        access(all) var amount: UFix64
        access(all) var duration: UInt64
        access(all) var expiresAt: UFix64
        access(all) var entryPrice: UFix64
        access(all) var baseToken: String
        access(all) var isUp: Bool
        access(all) var isResolved: Bool
        access(all) var won: Bool

        init(betId: UInt64, bettor: Address, amount: UFix64, duration: UInt64, expiresAt: UFix64, entryPrice: UFix64, baseToken: String, isUp: Bool, isResolved: Bool, won: Bool) {
            self.betId = betId
            self.bettor = bettor
            self.amount = amount
            self.duration = duration
            self.expiresAt = expiresAt
            self.entryPrice = entryPrice
            self.baseToken = baseToken
            self.isUp = isUp
            self.isResolved = isResolved
            self.won = won
        }
    }
    access(all) var bets: {UInt64: BetData}
    access(self) var vault: @MockUSDC.Vault
    access(self) let oracleFeeVault: @{FungibleToken.Vault}



    access(self) fun getTokenPriceInUSD(tokenSymbol: String): UFix64 {
        let payment <- self.oracleFeeVault.withdraw(
            amount: BandOracle.getFee()
        )

        let priceData = BandOracle.getReferenceData(
            baseSymbol: tokenSymbol,
            quoteSymbol: "USD",
            payment: <- payment
        )

        return priceData.fixedPointRate
    }


    access(all) fun placeBet(payment: auth(FungibleToken.Withdraw) &MockUSDC.Vault, address: Address, duration: UInt64, amount: UFix64, baseToken: String, isBetUp: Bool): BetData {
        assert(duration >= self.minDuraton, message: self.ErrMinDuration)
        assert(duration <= self.maxDuration, message: self.ErrMaxDuration)
        assert(amount >= self.minBetAmount, message: self.ErrMinBetAmount)
        assert(amount <= self.maxBetAmount, message: self.ErrMaxBetAmount)
        
        let newBetId = self.betId
        self.betId = newBetId + 1

        self.vault.deposit(from: <- payment.withdraw(amount: amount))

        var lockedAmount = amount * self.winMultiplier;
        LiquidityManager.lockLiquidity(amount: lockedAmount)

        let currentTime = getCurrentBlock().timestamp
        let currentPrice = self.getTokenPriceInUSD(tokenSymbol: baseToken)
        let expireTime = currentTime + UFix64(duration)

        self.bets[newBetId] = BetData(
            betId: newBetId,
            bettor: address,
            amount: amount,
            duration: duration,
            expiresAt: expireTime,
            entryPrice: currentPrice,
            baseToken: baseToken,
            isUp: isBetUp,
            isResolved: false,
            won: false
        )

        if !self.userBets.containsKey(address) {
            self.userBets[address] = []
        }
        self.userBets[address]!.append(newBetId)

        return self.bets[newBetId]!
    }

    access(all) fun resolveBet(betId: UInt64, recipient: &{FungibleToken.Receiver}) {
        assert(self.bets.containsKey(betId), message: self.ErrBetNotFound)
        let bet = self.bets[betId]!
        let currentTime = getCurrentBlock().timestamp
        assert(currentTime >= bet.expiresAt, message: self.ErrBetIsNotExpired)

        let currentPrice = self.getTokenPriceInUSD(tokenSymbol: bet.baseToken)
        LiquidityManager.unlockLiquidity(amount: bet.amount * self.winMultiplier)

        var won = false

        if bet.isUp && currentPrice > bet.entryPrice {
            won = true
        } else if !bet.isUp && currentPrice < bet.entryPrice {
            won = true
        }

        var payout: UFix64 = 0.0
        var pnl: Fix64 = 0.0
        var protocolAllocation: UFix64 = 0.0
        
        if won {
            payout = bet.amount * self.winMultiplier
            protocolAllocation = bet.amount * self.protocolFeePercent
            recipient.deposit(from: <-self.vault.withdraw(amount: (payout - protocolAllocation)))
            pnl = -Fix64(payout)
        } else {
            protocolAllocation = bet.amount * self.protocolFeePercent
            pnl = Fix64(bet.amount - protocolAllocation)
        }

        self.protocolRevenue = self.protocolRevenue + protocolAllocation
        LiquidityManager.distributePnL(pnl: pnl)

        self.bets[betId] = BetData(
            betId: bet.betId,
            bettor: bet.bettor,
            amount: bet.amount,
            duration: bet.duration,
            expiresAt: bet.expiresAt,
            entryPrice: bet.entryPrice,
            baseToken: bet.baseToken,
            isUp: bet.isUp,
            isResolved: true,
            won: won
        )
    }

    access(all) fun getUserBets(address: Address): [UInt64] {
        if self.userBets.containsKey(address) {
            return self.userBets[address]!
        }
        return []
    }

    access(all) fun getBetDetails(betId: UInt64): BetData? {
        if self.bets.containsKey(betId) {
            return self.bets[betId]!
        }
        return nil
    }

    init() {
        self.betId = 0
        self.winMultiplier = 1.75
        self.minDuraton = 120
        self.maxDuration = 600
        self.minBetAmount = 1.0
        self.maxBetAmount = 1000.0
        self.protocolFeePercent = 0.1 // 10% from bet amount
        self.protocolRevenue = 0.0
        self.bets = {}
        self.userBets = {}
        self.oracleFeeVault <- FlowToken.createEmptyVault(
            vaultType: Type<@FlowToken.Vault>()
        )
        self.vault <- MockUSDC.createEmptyVault(
            vaultType: Type<@MockUSDC.Vault>()
        )

        // Errors
        self.ErrMinDuration = "Minimum bet duration is 120 seconds"
        self.ErrMaxDuration = "Maximum bet duration is 600 seconds"
        self.ErrMinBetAmount = "Minimum bet amount is 1 USDC"
        self.ErrMaxBetAmount = "Maximum bet amount is 1000 USDC"
        self.ErrBetNotFound = "Bet not found"
        self.ErrBetIsNotExpired = "Bet has not expired yet"
    }
}