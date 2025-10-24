access(all) contract OptionsPricing {

    access(all) let VOLATILITY: UFix64
    access(all) let DAYS_PER_YEAR: UFix64
    access(all) let TIME_VALUE_COEFF: UFix64
    access(all) let MAX_PCT_DISTANCE: UFix64

    init() {
        self.VOLATILITY = 0.80
        self.DAYS_PER_YEAR = 365.0
        self.TIME_VALUE_COEFF = 0.496
        self.MAX_PCT_DISTANCE = 1.0
    }

    access(all) fun calculateIntrinsic(spot: UFix64, strike: UFix64, isCall: Bool): UFix64 {
        if isCall {
            return spot > strike ? spot - strike : 0.0
        } else {
            return strike > spot ? strike - spot : 0.0
        }
    }

    access(all) fun calculatePremium(spot: UFix64, strike: UFix64, duration: UFix64, isCall: Bool): UFix64 {
        let intrinsic = self.calculateIntrinsic(spot: spot, strike: strike, isCall: isCall)
        let sqrtTime = self.getSqrtTime(duration: duration)
        let timeValue = self.calculateTimeValue(spot: spot, strike: strike, sqrtTime: sqrtTime)
        return intrinsic + timeValue
    }

    access(self) fun absDiff(a: UFix64, b: UFix64): UFix64 {
        return a > b ? a - b : b - a
    }

    access(self) fun getMoneynessDistance(spot: UFix64, strike: UFix64): UFix64 {
        if strike <= 0.0 {
            return 1.0
        }
        let diff = self.absDiff(a: spot, b: strike)
        return diff / strike
    }

    access(self) fun getSqrtTime(duration: UFix64): UFix64 {
        let T = duration / self.DAYS_PER_YEAR
        return self.sqrt(n: T)
    }

    access(self) fun calculateTimeValue(spot: UFix64, strike: UFix64, sqrtTime: UFix64): UFix64 {
        let atmTimeValue = strike * self.VOLATILITY * sqrtTime * self.TIME_VALUE_COEFF
        let moneynessPct = self.getMoneynessDistance(spot: spot, strike: strike)
        let moneynessDecay = 1.0 - (moneynessPct / self.MAX_PCT_DISTANCE)
        let clampedDecay = moneynessDecay > 0.0 ? moneynessDecay : 0.0
        return atmTimeValue * clampedDecay
    }

    access(self) fun sqrt(n: UFix64): UFix64 {
        if n == 0.0 {
            return 0.0
        }
        var x = n
        var y = (x + 1.0) / 2.0
        let epsilon: UFix64 = 0.000001
        while self.absDiff(a: x, b: y) > epsilon {
            x = y
            y = (x + n / x) / 2.0
        }
        return y
    }
}