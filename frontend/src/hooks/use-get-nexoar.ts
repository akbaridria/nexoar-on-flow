import { useFlowCurrentUser, useFlowQuery } from "@onflow/react-sdk";
import FlowJson from "@/flow.json";

const GET_POOL_INFO_SCRIPT = `
import NexoarCore from 0x${FlowJson.accounts["nexoar-on-flow"].address}
access(all)
    fun main(): {String: AnyStruct} {
    return NexoarCore.getPoolInfo()
}
`;

const GET_PROVIDER_BALANCE_SCRIPT = `
import NexoarCore from 0x${FlowJson.accounts["nexoar-on-flow"].address}
access(all)
fun main(address: Address): UFix64 {
    return NexoarCore.getProviderBalance(provider: address)
}
`;
const useGetPoolInfo = () => {
  const { data, error, isLoading, isRefetching, refetch } = useFlowQuery({
    cadence: GET_POOL_INFO_SCRIPT,
    args: () => [],
  });

  return {
    poolInfo: data as {
      totalLiquidity: number;
      lockedLiquidity: number;
      availableLiquidity: number;
    },
    error,
    isLoading,
    isRefetching,
    refetch,
  };
};

const useGetProviderBalance = () => {
  const { user } = useFlowCurrentUser();
  const { data, error, isLoading, isRefetching, refetch } = useFlowQuery({
    cadence: GET_PROVIDER_BALANCE_SCRIPT,
    args: (arg, t) => [arg(user?.addr || "", t.Address)],
  });

  return {
    balance: data as number | undefined,
    error,
    isLoading,
    isRefetching,
    refetch,
  };
};

export { useGetPoolInfo, useGetProviderBalance };
