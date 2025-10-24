import Test

access(all) fun testOptionsPricing_Calculations() {

    let deployErr = Test.deployContract(
        name: "OptionsPricing",
        path: "../contracts/OptionsPricing.cdc",
        arguments: []
    )
    Test.expect(deployErr, Test.beNil())

    let spot: UFix64 = 110118.0
    let strike: UFix64 = 120000.0
    let duration: UFix64 = 1.0
    let isCall = true
    let expectedPremium = 2287.08881335

    let scriptCode = Test.readFile("../scripts/GetPremium.cdc")

    let result = Test.executeScript(
        scriptCode, [spot, strike, duration, isCall]
    )

    Test.expect(result.error, Test.beNil())

    let premium = result.returnValue as! UFix64
    
    var difference: UFix64 = 0.0
    if premium > expectedPremium {
        difference = premium - expectedPremium
    } else {
        difference = expectedPremium - premium
    }

    Test.assert(
        difference < 0.00000001,
        message: "Premium calculation did not match expected value. Got ".concat(premium.toString())
    )
}