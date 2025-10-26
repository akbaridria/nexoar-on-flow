import "OptionExerciseHandler"
import "FlowTransactionScheduler"

transaction() {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Save a handler resource to storage if not already present
        if signer.storage.borrow<&AnyResource>(from: /storage/OptionExerciseHandler) == nil {
            let handler <- OptionExerciseHandler.createHandler()
            signer.storage.save(<-handler, to: /storage/OptionExerciseHandler)
        }

        // Issue a capability with the correct entitlement for FlowTransactionScheduler
        let _ = signer.capabilities.storage
            .issue<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>(/storage/OptionExerciseHandler)

        // Issue a non-entitled public capability for the handler that is publicly accessible
        let publicCap = signer.capabilities.storage
            .issue<&{FlowTransactionScheduler.TransactionHandler}>(/storage/OptionExerciseHandler)
        signer.capabilities.publish(publicCap, at: /public/OptionExerciseHandler)
    }
}