# Configuration
NETWORK = testnet
ACCOUNT = nexoar-on-flow
USDC_AMOUNT = 100000.0
LIQUIDITY_AMOUNT = 100000.0
OPTION_STRIKE = 1.0
OPTION_DAYS = 1
OPTION_SIZE = 1
BET_AMOUNT = 100.0
BET_DURATION = 180
ACCOUNT_ADDRESS = 0x084a308894ddce19

.PHONY: all mint-usdc add-liquidity create-option place-bet remove-liquidity check-status

all: mint-usdc add-liquidity create-option place-bet remove-liquidity

# Mint Mock USDC tokens
mint-usdc:
	@echo "Minting Mock USDC..."
	flow transactions send cadence/transactions/mock-usdc/MintMockUSDC.cdc \
		--network $(NETWORK) \
		--signer $(ACCOUNT) \
		--args-json '[{"type": "UFix64", "value": "$(USDC_AMOUNT)"}]'

# Add liquidity to the protocol
add-liquidity:
	@echo "Adding liquidity..."
	flow transactions send cadence/transactions/nexoar-core/AddLiquidity.cdc \
		--network $(NETWORK) \
		--signer $(ACCOUNT) \
		--args-json '[{"type": "UFix64", "value": "$(LIQUIDITY_AMOUNT)"}]'

# Create an option
create-option:
	@echo "Creating option..."
	flow transactions send cadence/transactions/nexoar-core/CreateOptions.cdc \
		--network $(NETWORK) \
		--signer $(ACCOUNT) \
		--args-json '[{"type": "UFix64", "value": "$(OPTION_STRIKE)"}, {"type": "UInt64", "value": "$(OPTION_DAYS)"}, {"type": "Bool", "value": true}, {"type": "UInt64", "value": "$(OPTION_SIZE)"}, {"type": "String", "value": "FLOW"}, {"type": "Address", "value": "$(ACCOUNT_ADDRESS)"}, {"type": "UInt8", "value": "1"}, {"type": "UInt64", "value": "1000"}]'

# Place a flashbet
place-bet:
	@echo "Placing flashbet..."
	flow transactions send cadence/transactions/flashbet/PlaceBet.cdc \
		--network $(NETWORK) \
		--signer $(ACCOUNT) \
		--args-json '[{"type": "UInt64", "value": "$(BET_DURATION)"}, {"type": "UFix64", "value": "$(BET_AMOUNT)"}, {"type": "String", "value": "FLOW"}, {"type": "Bool", "value": true}, {"type": "Address", "value": "$(ACCOUNT_ADDRESS)"}, {"type": "UInt8", "value": "1"}, {"type": "UInt64", "value": "1000"}]'

# Remove half of the liquidity
remove-liquidity:
	@echo "Removing liquidity..."
	flow transactions send cadence/transactions/nexoar-core/RemoveLiquidity.cdc \
		--network $(NETWORK) \
		--signer $(ACCOUNT) \
		--args-json '[{"type": "UFix64", "value": "$(shell echo "$(LIQUIDITY_AMOUNT)/2" | bc)"}]'

# Check balances and status
check-status:
	@echo "Checking USDC balance..."
	flow scripts execute cadence/scripts/mock-usdc/GetBalance.cdc \
		--network $(NETWORK) \
		--args-json '[{"type": "Address", "value": "$(ACCOUNT_ADDRESS)"}]'
	@echo "\nChecking provider balance..."
	flow scripts execute cadence/scripts/nexoar-core/GetProviderBalance.cdc \
		--network $(NETWORK) \
		--args-json '[{"type": "Address", "value": "$(ACCOUNT_ADDRESS)"}]'
	@echo "\nChecking pool info..."
	flow scripts execute cadence/scripts/nexoar-core/GetPoolInfo.cdc \
		--network $(NETWORK)
	@echo "\nChecking total liquidity..."
	flow scripts execute cadence/scripts/liquidity-manager/GetTotalLiquidity.cdc \
		--network $(NETWORK)
	@echo "\nChecking utilization rate..."
	flow scripts execute cadence/scripts/liquidity-manager/GetUtilizationRate.cdc \
		--network $(NETWORK)
	@echo "\nChecking available liquidity..."
	flow scripts execute cadence/scripts/liquidity-manager/GetAvailableLiquidity.cdc \
		--network $(NETWORK)