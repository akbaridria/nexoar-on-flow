import Test

access(all) let account = Test.createAccount()

access(all) fun testContract() {
    let err = Test.deployContract(
        name: "NexoarCoreV3",
        path: "../contracts/NexoarCoreV3.cdc",
        arguments: [],
    )

    Test.expect(err, Test.beNil())
}