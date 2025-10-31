import "FlowTransactionScheduler"
import "NexoarCoreV3"
import "MockUSDC"
import "FungibleToken"

access(all) contract OptionExerciseHandler {
    access(all) resource Handler: FlowTransactionScheduler.TransactionHandler {
        access(FlowTransactionScheduler.Execute) fun executeTransaction(id: UInt64, data: AnyStruct?) {
            let dict = data as! {String: AnyStruct}
            let optionId = dict["optionId"] as! UInt64
            let recipientAddr = dict["recipient"] as! Address

            let recipient = getAccount(recipientAddr)
                .capabilities
                .borrow<&{FungibleToken.Receiver}>(/public/mockUSDCTokenReceiver)
                ?? panic("Could not borrow receiver")

            NexoarCoreV3.exerciseOption(optionId: optionId, recipient: recipient)
        }
    }

    access(all) fun createHandler(): @Handler {
        return <- create Handler()
    }
}