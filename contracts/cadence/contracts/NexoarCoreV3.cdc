import "BandOracle"
import "FlowToken"
import "FungibleToken"
import "LiquidityManager"
import "OptionsPricing"
import "MockUSDC"

access(all)
contract NexoarCoreV3 {
    // data errors
    access(all) let StrikePriceZeroError: String
    access(all) let DaysZeroError: String
    access(all) let SizeZeroError: String
    access(all) let PremiumMismatchError: String
    access(all) let OptionDoesNotExistError: String
    access(all) let OptionNotExpiredError: String
    access(all) let OptionAlreadyExercisedError: String

    // data vars
    access(all) var optionId: UInt64
    access(all) var protocolRevenue: UFix64
    access(all) var protocolRevenuePercentage: UFix64
    access(all) var userOptions: {Address: [UInt64]}
    access(all) var optionsData: {UInt64: OptionsData}


    access(all) struct OptionsData {
        access(all) var optionId: UInt64
        access(all) var owner: Address
        access(all) var strike: UFix64
        access(all) var expiry: UFix64
        access(all) var size: UInt64
        access(all) var isCall: Bool
        access(all) var premium: UFix64
        access(all) var lockedLiquidity: UFix64
        access(all) var isExercised: Bool
        access(all) var profit: UFix64
        access(all) var exercisePrice: UFix64
        access(all) var tokenSymbol: String

        init(optionId: UInt64, owner: Address, strike: UFix64, expiry: UFix64, size: UInt64, isCall: Bool, premium: UFix64, lockedLiquidity: UFix64, isExercised: Bool, profit: UFix64, exercisePrice: UFix64, tokenSymbol: String) {
            self.optionId = optionId
            self.owner = owner
            self.strike = strike
            self.expiry = expiry
            self.size = size
            self.isCall = isCall
            self.premium = premium
            self.lockedLiquidity = lockedLiquidity
            self.isExercised = isExercised
            self.profit = profit
            self.exercisePrice = exercisePrice
            self.tokenSymbol = tokenSymbol
        }
    }

    access(self) let oracleFeeVault: @{FungibleToken.Vault}
    access(self) var vault: @MockUSDC.Vault

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

    access(all) fun createOption(payment: auth(FungibleToken.Withdraw) &MockUSDC.Vault, strikePrice: UFix64, days: UInt64, isCall: Bool, size: UInt64, tokenSymbol: String, address: Address): OptionsData {
        assert(strikePrice > 0.0, message: self.StrikePriceZeroError)
        assert(days > 0, message: self.DaysZeroError)
        assert(size > 0, message: self.SizeZeroError)

        let newOptionId = self.optionId
        self.optionId = self.optionId + 1

        let premium = OptionsPricing.calculatePremium(
            spot: self.getTokenPriceInUSD(tokenSymbol: tokenSymbol),
            strike: strikePrice,
            duration: UFix64(days),
            isCall: isCall
        )
        
        // Deposit premium to protocol vaul
        self.vault.deposit(from: <- payment.withdraw(amount: premium))

        // currently hardcoded liquidity requirement as 2x premium
        // this can be adjusted based on risk models later
        var lockedLiquidity = premium * 2.0
        LiquidityManager.lockLiquidity(amount: lockedLiquidity)

        let expiryTime = getCurrentBlock().timestamp + UFix64((days * 86400))
        self.optionsData[newOptionId] = OptionsData(
            optionId: newOptionId,
            owner: address,
            strike: strikePrice,
            expiry: expiryTime,
            size: size,
            isCall: isCall,
            premium: premium,
            lockedLiquidity: lockedLiquidity,
            isExercised: false,
            profit: 0.0,
            exercisePrice: 0.0,
            tokenSymbol: tokenSymbol
        )
        if !self.userOptions.containsKey(address) {
            self.userOptions[address] = []
        }
        self.userOptions[address]!.append(newOptionId)
        
        return self.optionsData[newOptionId]!
    }

    access(all) fun exerciseOption(optionId: UInt64, recipient: &{FungibleToken.Receiver}) {
        
        assert(self.optionsData.containsKey(optionId), message: self.OptionDoesNotExistError)
        let option = self.optionsData[optionId]!
        assert(getCurrentBlock().timestamp >= option.expiry, message: self.OptionNotExpiredError)
        assert(!option.isExercised, message: self.OptionAlreadyExercisedError)

        
        let spot = self.getTokenPriceInUSD(tokenSymbol: option.tokenSymbol) 

        
        let intrinsic = OptionsPricing.calculateIntrinsic(
            spot: spot,
            strike: UFix64(option.strike),
            isCall: option.isCall
        )
        let payout = intrinsic * UFix64(option.size)

        
        let protocolRevenue = option.premium * 0.10
        self.protocolRevenue = self.protocolRevenue + protocolRevenue

        
        LiquidityManager.unlockLiquidity(amount: UFix64(option.lockedLiquidity))

        
        let pnl = Fix64(payout - option.premium)
        LiquidityManager.distributePnL(pnl: pnl)

        
        if payout > 0.0 {
            let vault <- self.vault.withdraw(amount: payout)
            recipient.deposit(from: <-vault)
        }

        
        self.optionsData[optionId] = OptionsData(
            optionId: option.optionId,
            owner: option.owner,
            strike: option.strike,
            expiry: option.expiry,
            size: option.size,
            isCall: option.isCall,
            premium: option.premium,
            lockedLiquidity: option.lockedLiquidity,
            isExercised: true,
            profit: payout - option.premium,
            exercisePrice: spot,
            tokenSymbol: option.tokenSymbol
        )
    }

    access(all) fun addLiquidity(payment: @MockUSDC.Vault, amount: UFix64, address: Address) {
        self.vault.deposit(from: <- payment)
        LiquidityManager.addLiquidity(provider: address, amount: amount)
    }

    access(all) fun removeLiquidity(amount: UFix64, address: Address, recipient: &{FungibleToken.Receiver}) {
        recipient.deposit(from: <- self.vault.withdraw(amount: amount))
        LiquidityManager.removeLiquidity(provider: address, amount: amount)
    }

    access(all) fun getDetailOptionsData(optionId: UInt64): OptionsData? {
        if self.optionsData.containsKey(optionId) {
            return self.optionsData[optionId]!
        }
        return nil
    }

    access(all) fun getUserOptions(address: Address): [UInt64] {
        if self.userOptions.containsKey(address) {
            return self.userOptions[address]!
        }
        return []
    }

    access(all) fun getProviderBalance(provider: Address): UFix64 {
        return LiquidityManager.getProviderBalance(provider: provider)
    }

    access(all) fun getPoolInfo(): {String: AnyStruct} {
        return {
            "totalLiquidity": LiquidityManager.totalLiquidity,
            "lockedLiquidity": LiquidityManager.lockedLiquidity,
            "availableLiquidity": LiquidityManager.totalLiquidity - LiquidityManager.lockedLiquidity
        }
    }

    init() {
        self.optionId = 0
        self.protocolRevenue = 0.0
        self.protocolRevenuePercentage = 0.1 // 10% from the premium
        self.optionsData = {}
        self.userOptions = {}
        self.oracleFeeVault <- FlowToken.createEmptyVault(
            vaultType: Type<@FlowToken.Vault>()
        )
        self.vault <- MockUSDC.createEmptyVault(
            vaultType: Type<@MockUSDC.Vault>()
        )


        // Errors
        self.StrikePriceZeroError = "Strike price must be greater than zero"
        self.DaysZeroError = "Days must be greater than zero"
        self.SizeZeroError = "Size must be greater than zero"
        self.PremiumMismatchError = "Calculated premium does not match expected premium"
        self.OptionDoesNotExistError = "Option does not exist"
        self.OptionNotExpiredError = "Option has not expired yet"
        self.OptionAlreadyExercisedError = "Option has already been exercised"
    }
}