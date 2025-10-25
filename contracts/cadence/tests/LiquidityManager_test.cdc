import Test
import "VaultTracker"
import "LiquidityManager"

access(all) let provider = Test.createAccount()

access(all) fun setup() {
    // Deploy VaultTracker
    let vaultTracker = Test.deployContract(
        name: "VaultTracker",
        path: "../contracts/VaultTracker.cdc",
        arguments: []
    )
    Test.expect(vaultTracker, Test.beNil())

    // Deploy LiquidityManager
    let liquidityManager = Test.deployContract(
        name: "LiquidityManager",
        path: "../contracts/LiquidityManager.cdc",
        arguments: []
    )
    Test.expect(liquidityManager, Test.beNil())
}

access(all) fun testAddLiquidity() {

    // Add liquidity
    let amount: UFix64 = 100.0
    let stakeTxCode = Test.readFile("../transactions/liquidity-manager/AddLiquidity.cdc")

    let stakeTx = Test.Transaction(
        code: stakeTxCode,
        authorizers: [provider.address],
        signers: [provider],
        arguments: [provider.address, amount]
    )
    let stakeResult = Test.executeTransaction(stakeTx)
    Test.expect(stakeResult, Test.beSucceeded())

    // Verify total liquidity
    let getTotalLiquidityScript = Test.readFile("../scripts/liquidity-manager/GetTotalLiquidity.cdc")
    let totalLiquidityResult = Test.executeScript(getTotalLiquidityScript, [])
    Test.expect(totalLiquidityResult, Test.beSucceeded())
    Test.assertEqual(amount, totalLiquidityResult.returnValue as! UFix64)

    // Verify VaultTracker stake
    let getProviderStakeScript = Test.readFile("../scripts/vault-tracker/GetProviderStake.cdc")
    let providerStakeResult = Test.executeScript(getProviderStakeScript, [provider.address])
    Test.expect(providerStakeResult, Test.beSucceeded())
    Test.assertEqual(amount, providerStakeResult.returnValue as! UFix64)
}

access(all) fun testRemoveLiquidity() {

    // Add liquidity
    let amount: UFix64 = 100.0

    // Remove liquidity
    let removeAmount: UFix64 = 50.0
    let removeTxCode = Test.readFile("../transactions/liquidity-manager/RemoveLiquidity.cdc")
    let removeTx = Test.Transaction(
        code: removeTxCode,
        authorizers: [provider.address],
        signers: [provider],
        arguments: [provider.address, removeAmount]
    )
    let result = Test.executeTransaction(removeTx)
    Test.expect(result, Test.beSucceeded())

    // Verify total liquidity
    let getTotalLiquidityScript = Test.readFile("../scripts/liquidity-manager/GetTotalLiquidity.cdc")

    let totalLiquidityResult = Test.executeScript(getTotalLiquidityScript, [])
    Test.expect(totalLiquidityResult, Test.beSucceeded())
    Test.assertEqual(amount - removeAmount, totalLiquidityResult.returnValue as! UFix64)

    // Verify VaultTracker stake
    let getProviderStakeScript = Test.readFile("../scripts/vault-tracker/GetProviderStake.cdc")
    let stakeResult = Test.executeScript(getProviderStakeScript, [provider.address])
    Test.expect(stakeResult, Test.beSucceeded())
    Test.assertEqual(amount - removeAmount, stakeResult.returnValue as! UFix64)
}

access(all) fun testLockAndUnlockLiquidity() {
    let provider = Test.createAccount()
    let amount = 50
    // Lock liquidity
    let lockAmount: UFix64 = 30.0
    let lockLiquidityTxCode = Test.readFile("../transactions/liquidity-manager/LockLiquidity.cdc")
    let lockLiquidityTx = Test.Transaction(
        code: lockLiquidityTxCode,
        authorizers: [provider.address],
        signers: [provider],
        arguments: [lockAmount]
    )
    let lockResult = Test.executeTransaction(lockLiquidityTx)
    Test.expect(lockResult, Test.beSucceeded())

    // Verify available liquidity
    let availableLiquidity = 20.0
    let availableLiquidityScript = Test.readFile("../scripts/liquidity-manager/GetAvailableLiquidity.cdc")
    let availableLiquidityResult = Test.executeScript(availableLiquidityScript, [])
    Test.expect(availableLiquidityResult, Test.beSucceeded())
    Test.assertEqual(availableLiquidity, availableLiquidityResult.returnValue as! UFix64)

    // Verify utilization rate
    let utilizationRateScript = Test.readFile("../scripts/liquidity-manager/GetUtilizationRate.cdc")
    let utilizationResult = Test.executeScript(utilizationRateScript, [])
    Test.expect(utilizationResult, Test.beSucceeded())
    Test.assertEqual(Fix64(lockAmount) / Fix64(amount), utilizationResult.returnValue as! Fix64)

    // Unlock liquidity
    let unlockAmount: UFix64 = 20.0
    let unlockLiquidityTxCode = Test.readFile("../transactions/liquidity-manager/UnlockLiquidity.cdc")
    let unlockLiquidityTx = Test.Transaction(
        code: unlockLiquidityTxCode,
        authorizers: [provider.address],
        signers: [provider],
        arguments: [unlockAmount]
    )
    let unlockResult = Test.executeTransaction(unlockLiquidityTx)
    Test.expect(unlockResult, Test.beSucceeded())

    // Verify available liquidity

    let finalAvailableLiquidityResult = Test.executeScript(availableLiquidityScript, [])
    Test.expect(finalAvailableLiquidityResult, Test.beSucceeded())
    Test.assertEqual(40.0, finalAvailableLiquidityResult.returnValue as! UFix64)
}

access(all) fun testDistributePnL() {
    let provider = Test.createAccount()

    // Add liquidity
    let amount: UFix64 = 100.0
    let stakeTxCode = Test.readFile("../transactions/liquidity-manager/AddLiquidity.cdc")

    let stakeTx = Test.Transaction(
        code: stakeTxCode,
        authorizers: [provider.address],
        signers: [provider],
        arguments: [provider.address, amount]
    )
    let stakeResult = Test.executeTransaction(stakeTx)
    Test.expect(stakeResult, Test.beSucceeded())

    // Distribute positive PnL
    let pnl: Fix64 = 20.0
    let distributePnLTxCode = Test.readFile("../transactions/liquidity-manager/DistributePnL.cdc")
    let distributePnLTx = Test.Transaction(
        code: distributePnLTxCode,
        authorizers: [provider.address],
        signers: [provider],
        arguments: [pnl]
    )
    let result = Test.executeTransaction(distributePnLTx)
    Test.expect(result, Test.beSucceeded())

    // Verify total liquidity
    let totalLiquidityScript = Test.readFile("../scripts/liquidity-manager/GetTotalLiquidity.cdc")
    let totalLiquidityResult = Test.executeScript(totalLiquidityScript, [])
    Test.expect(totalLiquidityResult, Test.beSucceeded())
    Test.assertEqual(150.0 + UFix64(pnl), totalLiquidityResult.returnValue as! UFix64)

    // Verify provider balance
    let providerBalanceScript = Test.readFile("../scripts/liquidity-manager/GetProviderBalance.cdc")
    let providerBalanceResult = Test.executeScript(providerBalanceScript, [provider.address])
    Test.expect(providerBalanceResult, Test.beSucceeded())
    Test.assertEqual(113.33333300, providerBalanceResult.returnValue as! UFix64)
}
