import Test

access(all) let account = Test.createAccount()

access(all) fun testContract() {
    let err = Test.deployContract(
        name: "MockUSDC",
        path: "../contracts/MockUSDC.cdc",
        arguments: [],
    )

    Test.expect(err, Test.beNil())
}