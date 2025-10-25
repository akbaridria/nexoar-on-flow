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

access(all) fun testCreateEmptyVault() {
    // Create an account to hold the vault
    let account = Test.createAccount()

    // Execute transaction to create and store an empty vault
    let setupAccountTxCode = Test.readFile("../transactions/SetupAccount.cdc")
    let setupAccountTx = Test.Transaction(
        code: setupAccountTxCode,
        authorizers: [account.address],
        signers: [account],
        arguments: []
    )
    
    let result = Test.executeTransaction(setupAccountTx)
    Test.expect(result, Test.beSucceeded())

    let getBalanceScriptCode = Test.readFile("../scripts/GetBalance.cdc")

    // Verify the vault balance is 0.0
    let scriptResult = Test.executeScript(getBalanceScriptCode, [account.address])
    Test.expect(scriptResult, Test.beSucceeded())
    Test.assertEqual(0.0, scriptResult.returnValue as! UFix64)
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

    // // Verify total supply
    // let supplyResult = Test.executeScript(
    //     path: "./transactions/scripts/get_supply.cdc",
    //     arguments: []
    // )
    // Test.expect(supplyResult, Test.beSucceeded())
    // Test.assertEqual(1000.0 + mintAmount, supplyResult.returnValue as! UFix64) // Initial supply (1000.0) + minted amount
}

// access(all) fun testTransferTokens() {
//     // Create sender and receiver accounts
//     let sender = Test.createAccount()
//     let receiver = Test.createAccount()

//     // Setup both accounts with vaults
//     Test.executeTransaction(
//         path: "./transactions/setup_account.cdc",
//         arguments: [],
//         signers: [sender]
//     )
//     Test.executeTransaction(
//         path: "./transactions/setup_account.cdc",
//         arguments: [],
//         signers: [receiver]
//     )

//     // Create a Minter for the sender
//     Test.executeTransaction(
//         path: "./transactions/create_minter.cdc",
//         arguments: [],
//         signers: [sender]
//     )

//     // Mint tokens to sender
//     let mintAmount: UFix64 = 50.0
//     Test.executeTransaction(
//         path: "./transactions/mint_tokens.cdc",
//         arguments: [mintAmount],
//         signers: [sender]
//     )

//     // Transfer tokens
//     let transferAmount: UFix64 = 20.0
//     let transferResult = Test.executeTransaction(
//         path: "./transactions/transfer_tokens.cdc",
//         arguments: [receiver.address, transferAmount, /public/mockUSDCTokenReceiver],
//         signers: [sender]
//     )
//     Test.expect(transferResult, Test.beSucceeded())

//     // Verify sender balance
//     let senderBalance = Test.executeScript(
//         path: "./transactions/scripts/get_balance.cdc",
//         arguments: [sender.address]
//     )
//     Test.expect(senderBalance, Test.beSucceeded())
//     Test.assertEqual(mintAmount - transferAmount, senderBalance.returnValue as! UFix64)

//     // Verify receiver balance
//     let receiverBalance = Test.executeScript(
//         path: "./transactions/scripts/get_balance.cdc",
//         arguments: [receiver.address]
//     )
//     Test.expect(receiverBalance, Test.beSucceeded())
//     Test.assertEqual(transferAmount, receiverBalance.returnValue as! UFix64)
// }

// access(all) fun testMetadataViews() {
//     // Test FTDisplay metadata
//     let displayScript = Test.executeScript(
//         path: "./transactions/scripts/get_metadata.cdc",
//         arguments: [Type<FungibleTokenMetadataViews.FTDisplay>()]
//     )
//     Test.expect(displayScript, Test.beSucceeded())
//     let display = displayScript.returnValue as! FungibleTokenMetadataViews.FTDisplay
//     Test.assertEqual("Mock USDC Token", display.name)
//     Test.assertEqual("MUSDC", display.symbol)
//     Test.assertEqual("A mock USDC token for testing on the Flow blockchain.", display.description)

//     // Test FTVaultData
//     let vaultDataScript = Test.executeScript(
//         path: "./transactions/scripts/get_metadata.cdc",
//         arguments: [Type<FungibleTokenMetadataViews.FTVaultData>()]
//     )
//     Test.expect(vaultDataScript, Test.beSucceeded())
//     let vaultData = vaultDataScript.returnValue as! FungibleTokenMetadataViews.FTVaultData
//     Test.assertEqual(/storage/mockUSDCTokenVault, vaultData.storagePath)
//     Test.assertEqual(/public/mockUSDCTokenReceiver, vaultData.receiverPath)
// }