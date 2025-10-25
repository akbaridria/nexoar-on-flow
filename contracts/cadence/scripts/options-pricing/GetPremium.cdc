import "OptionsPricing"

access(all) fun main(spot: UFix64, strike: UFix64, duration: UFix64, isCall: Bool): UFix64 {
    let premium = OptionsPricing.calculatePremium(
        spot: spot,
        strike: strike,
        duration: duration,
        isCall: isCall
    )
    return premium
}