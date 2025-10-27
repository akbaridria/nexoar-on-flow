import "NexoarCore"

access(all)
fun main(address: Address): UFix64 {
    return NexoarCore.getProviderBalance(provider: address)
}