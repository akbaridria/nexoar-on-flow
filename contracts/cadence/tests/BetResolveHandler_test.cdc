import Test

access(all) let account = Test.createAccount()

access(all) fun testContract() {
    let err = Test.deployContract(
        name: "BetResolveHandler",
        path: "../contracts/BetResolveHandler.cdc",
        arguments: [],
    )

    Test.expect(err, Test.beNil())
}