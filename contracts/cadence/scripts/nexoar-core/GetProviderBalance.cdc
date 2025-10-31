import "NexoarCoreV3"

access(all)
fun main(address: Address): UFix64 {
    return NexoarCoreV3.getProviderBalance(provider: address)
}