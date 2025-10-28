import FlowJson from "@/flow.json";
import { useFlowCurrentUser, useFlowQuery } from "@onflow/react-sdk";

const GET_BALANCE_SCRIPT = `
import FungibleToken from 0x${FlowJson.dependencies.FungibleToken.aliases.testnet}
import MockUSDC from 0x${FlowJson.accounts.nexoar.address}
import FungibleTokenMetadataViews from 0x${FlowJson.dependencies.FungibleTokenMetadataViews.aliases.testnet}

access(all) fun main(address: Address): UFix64 {
    let vaultData = MockUSDC.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
        ?? panic("Could not resolve FTVaultData view")
    return getAccount(address).capabilities.borrow<&{FungibleToken.Balance}>(vaultData.metadataPath)?.balance
        ?? panic("Could not borrow Balance reference")
}
`;

const useGetUSDC = () => {
  const { user } = useFlowCurrentUser();
  const { data, isLoading, error, isRefetching, refetch } = useFlowQuery({
    cadence: GET_BALANCE_SCRIPT,
    args: (arg, t) => [arg(user?.addr || "", t.Address)],
  });

  return {
    balance: data as number | undefined,
    isLoading,
    error,
    isRefetching,
    refetch,
  };
};

export default useGetUSDC;
