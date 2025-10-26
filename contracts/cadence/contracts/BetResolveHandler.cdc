import "FlowTransactionScheduler"
import "Flashbet"
import "MockUSDC"
import "FungibleToken"

access(all) contract BetResolveHandler {
    access(all) resource Handler: FlowTransactionScheduler.TransactionHandler {
        access(FlowTransactionScheduler.Execute) fun executeTransaction(id: UInt64, data: AnyStruct?) {
            let dict = data as! {String: AnyStruct}
            let betId = dict["betId"] as! UInt64
            let recipientAddr = dict["recipient"] as! Address

            let recipient = getAccount(recipientAddr)
                .capabilities
                .borrow<&{FungibleToken.Receiver}>(/public/mockUSDCTokenReceiver)
                ?? panic("Could not borrow receiver")

            Flashbet.resolveBet(betId: betId, recipient: recipient)
        }
    }

    access(all) fun createHandler(): @Handler {
        return <- create Handler()
    }
}