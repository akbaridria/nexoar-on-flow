# Nexoar On Flow: Liquidity, Options, and Flashbet Demo

This project demonstrates a DeFi protocol on Flow with scheduled transactions, liquidity management, options trading, and flashbet functionality.

## Key Contracts

- [`cadence/contracts/NexoarCore.cdc`](cadence/contracts/NexoarCore.cdc)
- [`cadence/contracts/LiquidityManager.cdc`](cadence/contracts/LiquidityManager.cdc)
- [`cadence/contracts/VaultTracker.cdc`](cadence/contracts/VaultTracker.cdc)
- [`cadence/contracts/OptionsPricing.cdc`](cadence/contracts/OptionsPricing.cdc)
- [`cadence/contracts/MockUSDC.cdc`](cadence/contracts/MockUSDC.cdc)
- [`cadence/contracts/Flashbet.cdc`](cadence/contracts/Flashbet.cdc)
- [`cadence/contracts/BetResolveHandler.cdc`](cadence/contracts/BetResolveHandler.cdc)
- [`cadence/contracts/OptionExerciseHandler.cdc`](cadence/contracts/OptionExerciseHandler.cdc)

## Project Structure

- `flow.json` – Project configuration and contract deployment settings
- `/cadence/contracts` – Core protocol contracts
- `/cadence/transactions` – State-changing operations (mint, add/remove liquidity, create/exercise options, place bets)
- `/cadence/scripts` – Read-only queries (balances, pool info, provider info)
- `/cadence/tests` – Integration tests for contracts and flows

## Example Workflow

### 1. Mint Mock USDC

```sh
flow transactions send cadence/transactions/mock-usdc/MintMockUSDC.cdc \
  --network testnet \
  --signer nexoar-on-flow \
  --args-json '[{"type": "UFix64", "value": "100000.0"}]'
```

### 2. Add Liquidity

```sh
flow transactions send cadence/transactions/nexoar-core/AddLiquidity.cdc \
  --network testnet \
  --signer nexoar-on-flow \
  --args-json '[{"type": "UFix64", "value": "50000.0"}]'
```

### 3. Create an Option

```sh
flow transactions send cadence/transactions/nexoar-core/CreateOptions.cdc \
  --network testnet \
  --signer nexoar-on-flow \
  --args-json '[{"type": "UFix64", "value": "1.0"}, {"type": "UInt64", "value": "1"}, {"type": "Bool", "value": true}, {"type": "UInt64", "value": "1"}, {"type": "String", "value": "FLOW"}, {"type": "Address", "value": "0x084a308894ddce19"}, {"type": "UInt8", "value": "1"}, {"type": "UInt64", "value": "1000"}]'
```

### 4. Place a Flashbet

```sh
flow transactions send cadence/transactions/flashbet/PlaceBet.cdc \
  --network testnet \
  --signer nexoar-on-flow \
  --args-json '[{"type": "UInt64", "value": "180"}, {"type": "UFix64", "value": "100.0"}, {"type": "String", "value": "FLOW"}, {"type": "Bool", "value": true}, {"type": "Address", "value": "0x084a308894ddce19"}, {"type": "UInt8", "value": "1"}, {"type": "UInt64", "value": "1000"}]'
```

### 5. Remove Liquidity

```sh
flow transactions send cadence/transactions/nexoar-core/RemoveLiquidity.cdc \
  --network testnet \
  --signer nexoar-on-flow \
  --args-json '[{"type": "UFix64", "value": "25000.0"}]'
```

### 6. Query Balances and Pool Info

```sh
flow scripts execute cadence/scripts/mock-usdc/GetBalance.cdc \
  --network testnet \
  --args-json '[{"type": "Address", "value": "0x084a308894ddce19"}]'

flow scripts execute cadence/scripts/nexoar-core/GetProviderBalance.cdc \
  --network testnet \
  --args-json '[{"type": "Address", "value": "0x084a308894ddce19"}]'

flow scripts execute cadence/scripts/nexoar-core/GetPoolInfo.cdc --network testnet

flow scripts execute cadence/scripts/liquidity-manager/GetTotalLiquidity.cdc --network testnet

flow scripts execute cadence/scripts/liquidity-manager/GetUtilizationRate.cdc --network testnet

flow scripts execute cadence/scripts/liquidity-manager/GetAvailableLiquidity.cdc --network testnet
```

## Testing

Run integration tests in [`cadence/tests`](cadence/tests) to verify contract logic for liquidity, options, and flashbet flows.

You can also run the full workflow and tests using:

```sh
make all
```

This will execute all necessary steps for the workflow in testnet as defined in the `Makefile`.

## Notes

- See the [Makefile](Makefile) for automated workflow examples.
- For scheduled transactions, see the handler contracts and transaction files in `/cadence/transactions`.