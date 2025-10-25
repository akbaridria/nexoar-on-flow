import Test
import "FungibleToken"
import "FungibleTokenMetadataViews"
import "MockUSDC"

access(all) fun setup() {
    // Deploy the MockUSDC contract
    let mockUSDCAcct = Test.createAccount()
    let txRes = Test.deployContract(
        name: "MockUSDC",
        path: "../contracts/MockUSDC.cdc",
        arguments: []
    )

    Test.expect(txRes, Test.beNil())
}

access(all) fun testMintTokens() {
    let minterAccount = Test.createAccount()

    // Mint tokens
    let mintAmount: UFix64 = 100.0
    let mintTxCode = Test.readFile("../transactions/MintMockUSDC.cdc")
    let mintTx = Test.Transaction(
        code: mintTxCode,
        authorizers: [minterAccount.address],
        signers: [minterAccount],
        arguments: [mintAmount]
    )

    let mintResult = Test.executeTransaction(mintTx)
    Test.expect(mintResult, Test.beSucceeded())

    // Verify the balance
    let getBalanceScriptCode = Test.readFile("../scripts/GetBalance.cdc")
    let balanceResult = Test.executeScript(getBalanceScriptCode, [minterAccount.address])
    Test.expect(balanceResult, Test.beSucceeded())
    Test.assertEqual(mintAmount, balanceResult.returnValue as! UFix64)

    // Verify total supply
    let totalSupplyScriptCode = Test.readFile("../scripts/GetTotalSupply.cdc")
    let supplyResult = Test.executeScript(totalSupplyScriptCode, [])
    Test.expect(supplyResult, Test.beSucceeded())
    Test.assertEqual(1000.0 + mintAmount, supplyResult.returnValue as! UFix64) // Initial supply (1000.0) + minted amount
}

access(all) fun testTransferTokens() {
    // Create sender and receiver accounts
    let sender = Test.createAccount()
    let receiver = Test.createAccount()

    // Mint tokens to sender
    let mintAmount: UFix64 = 100.0
    let mintTxCode = Test.readFile("../transactions/MintMockUSDC.cdc")
    let mintTx = Test.Transaction(
        code: mintTxCode,
        authorizers: [sender.address],
        signers: [sender],
        arguments: [mintAmount]
    )
    let mintResult = Test.executeTransaction(mintTx)
    Test.expect(mintResult, Test.beSucceeded())

    // Mint tokens to receiver
    let mintReceiverTx = Test.Transaction(
        code: mintTxCode,
        authorizers: [receiver.address],
        signers: [receiver],
        arguments: [mintAmount]
    )
    let mintReceiverResult = Test.executeTransaction(mintReceiverTx)
    Test.expect(mintReceiverResult, Test.beSucceeded())

    // transfer tokens from sender to receiver
    let transferAmount: UFix64 = 25.0
    let transferTxCode = Test.readFile("../transactions/TransferMockUSDC.cdc")
    let transferTx = Test.Transaction(
        code: transferTxCode,
        authorizers: [sender.address],
        signers: [sender],
        arguments: [receiver.address, transferAmount]
    )

    let transferResult = Test.executeTransaction(transferTx)
    Test.expect(transferResult, Test.beSucceeded())

    // Verify sender balance
    let getBalanceScriptCode = Test.readFile("../scripts/GetBalance.cdc")
    let balanceResult = Test.executeScript(getBalanceScriptCode, [sender.address])
    Test.expect(balanceResult, Test.beSucceeded())
    Test.assertEqual(mintAmount - transferAmount, balanceResult.returnValue as! UFix64)

    // Verify receiver balance
    let receiverBalanceResult = Test.executeScript(getBalanceScriptCode, [receiver.address])
    Test.expect(receiverBalanceResult, Test.beSucceeded())
    Test.assertEqual(mintAmount + transferAmount, receiverBalanceResult.returnValue as! UFix64)
}