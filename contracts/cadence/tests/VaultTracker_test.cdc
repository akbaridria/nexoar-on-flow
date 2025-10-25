import Test
import "VaultTracker"

access(all) fun setup() {
    let deployResult = Test.deployContract(
        name: "VaultTracker",
        path: "../contracts/VaultTracker.cdc",
        arguments: []
    )
    Test.expect(deployResult, Test.beNil())
}

access(all) fun testAddStake() {
    let provider = Test.createAccount()

    // Add stake for provider
    let stakeAmount: UFix64 = 50.0
    let addStakeCode = Test.readFile("../transactions/vault-tracker/AddStake.cdc")

    let addStakeTx = Test.Transaction(
        code: addStakeCode,
        authorizers: [provider.address],
        signers: [provider],
        arguments: [provider.address, stakeAmount]
    )
    let resultAddStake = Test.executeTransaction(addStakeTx)
    Test.expect(resultAddStake, Test.beSucceeded())

    // Verify provider stake
    let getProviderStakeScipt = Test.readFile("../scripts/vault-tracker/GetProviderStake.cdc")
    let stakeResult = Test.executeScript(getProviderStakeScipt, [provider.address])
    Test.expect(stakeResult, Test.beSucceeded())
    Test.assertEqual(stakeAmount, stakeResult.returnValue as! UFix64)

    // Verify pool info
    let poolInfoScript = Test.readFile("../scripts/vault-tracker/GetPoolInfo.cdc")
    let poolInfoResult = Test.executeScript(poolInfoScript, [])
    Test.expect(poolInfoResult, Test.beSucceeded())
    let poolInfo = poolInfoResult.returnValue as! {String: AnyStruct}
    Test.assertEqual(stakeAmount, poolInfo["totalStaked"]! as! UFix64)
    Test.assertEqual(0.0 as Fix64, poolInfo["accRewardPerShare"]! as! Fix64)
    Test.assertEqual(0.0 as Fix64, poolInfo["totalPnL"]! as! Fix64)
    Test.assertEqual(1, poolInfo["providerCount"]! as! Int)

    // Verify provider info
    let providerInfoScript = Test.readFile("../scripts/vault-tracker/GetProviderInfo.cdc")
    let providerInfoResult = Test.executeScript(providerInfoScript, [provider.address])
    Test.expect(providerInfoResult, Test.beSucceeded())
    let providerInfo = providerInfoResult.returnValue as! {String: AnyStruct}
    Test.assertEqual(stakeAmount, providerInfo["stake"]! as! UFix64)
    Test.assertEqual(0.0 as Fix64, providerInfo["pendingRewards"]! as! Fix64)
    Test.assertEqual(stakeAmount, providerInfo["effectiveBalance"]! as! UFix64)
}

access(all) fun testDistributePnLAndRemoveStake() {
    let provider = Test.createAccount()

    // Add stake
    // Add stake
    let stakeAmount: UFix64 = 50.0
    let addStakeCode = Test.readFile("../transactions/vault-tracker/AddStake.cdc")
    let addStakeTx = Test.Transaction(
        code: addStakeCode,
        authorizers: [provider.address],
        signers: [provider],
        arguments: [provider.address, stakeAmount]
    )
    let resultAddStake = Test.executeTransaction(addStakeTx)
    Test.expect(resultAddStake, Test.beSucceeded())

    // Distribute positive PnL
    let pnl: Fix64 = 5.0
    let distributePnLCode = Test.readFile("../transactions/vault-tracker/DistributePnL.cdc")
    let distributePnLTx = Test.Transaction(
        code: distributePnLCode,
        authorizers: [provider.address],
        signers: [provider],
        arguments: [pnl]
    )
    let distributeResult = Test.executeTransaction(distributePnLTx)
    Test.expect(distributeResult, Test.beSucceeded())

    let realPnL: Fix64 = pnl / 2.0 // since current test is not isolated and previous test also added stake of 50

    // Verify pending rewards
    let rewardsScript = Test.readFile("../scripts/vault-tracker/GetProviderPendingReward.cdc")
    let rewardsResult = Test.executeScript(rewardsScript, [provider.address])
    Test.expect(rewardsResult, Test.beSucceeded())
    Test.assertEqual(realPnL, rewardsResult.returnValue as! Fix64)

    // Verify effective balance
    let effectiveBalanceScript = Test.readFile("../scripts/vault-tracker/GetProviderEffectiveBalance.cdc")
    let effectiveBalanceResult = Test.executeScript(effectiveBalanceScript, [provider.address])
    Test.expect(effectiveBalanceResult, Test.beSucceeded())
    Test.assertEqual(stakeAmount + UFix64(realPnL), effectiveBalanceResult.returnValue as! UFix64)

    // Remove stake (including rewards)
    let removeAmount: UFix64 = stakeAmount + UFix64(realPnL)
    let removeStakeScript = Test.readFile("../transactions/vault-tracker/RemoveStake.cdc")
    let removeStakeTx = Test.Transaction(
        code: removeStakeScript,
        authorizers: [provider.address],
        signers: [provider],
        arguments: [provider.address, removeAmount]
    )
    let removeResult = Test.executeTransaction(removeStakeTx)
    Test.expect(removeResult, Test.beSucceeded())

    // Verify provider stake is zero
    let getProviderStakeScript = Test.readFile("../scripts/vault-tracker/GetProviderStake.cdc")
    let providerStakeResult = Test.executeScript(getProviderStakeScript, [provider.address])
    Test.expect(providerStakeResult, Test.beSucceeded())
    Test.assertEqual(0.0, providerStakeResult.returnValue as! UFix64)

    // Verify pool info
    let poolInfoScript = Test.readFile("../scripts/vault-tracker/GetPoolInfo.cdc")
    let poolInfoResult = Test.executeScript(poolInfoScript, [])
    Test.expect(poolInfoResult, Test.beSucceeded())
    let poolInfo = poolInfoResult.returnValue as! {String: AnyStruct}
    Test.assertEqual(stakeAmount, poolInfo["totalStaked"]! as! UFix64)
    Test.assertEqual(realPnL / Fix64(stakeAmount), poolInfo["accRewardPerShare"]! as! Fix64)
    Test.assertEqual(pnl, poolInfo["totalPnL"]! as! Fix64)
    Test.assertEqual(1, poolInfo["providerCount"]! as! Int)
}
