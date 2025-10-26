import "BetResolveHandler"
import "FlowTransactionScheduler"

transaction() {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        if signer.storage.borrow<&AnyResource>(from: /storage/BetResolveHandler) == nil {
            let handler <- BetResolveHandler.createHandler()
            signer.storage.save(<-handler, to: /storage/BetResolveHandler)
        }

        let _ = signer.capabilities.storage
            .issue<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>(/storage/BetResolveHandler)

        let publicCap = signer.capabilities.storage
            .issue<&{FlowTransactionScheduler.TransactionHandler}>(/storage/BetResolveHandler)
        signer.capabilities.publish(publicCap, at: /public/BetResolveHandler)
    }
}