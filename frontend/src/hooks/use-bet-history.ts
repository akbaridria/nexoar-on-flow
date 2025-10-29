import { useFlowCurrentUser, useFlowQuery } from "@onflow/react-sdk";
import FlowJson from "@/flow.json";

const GET_BET_HISTORY_SCRIPT = `
import Flashbet from 0x${FlowJson.accounts["nexoar-on-flow"].address}

access(all) fun main(address: Address): [UInt64] {
    return Flashbet.getUserBets(address: address)
}
`;

const GET_BET_DETAIL_SCRIPT = `
import Flashbet from 0x${FlowJson.accounts["nexoar-on-flow"].address}

access(all) fun main(betId: UInt64): Flashbet.BetData? {
    return Flashbet.getBetDetails(betId: betId)
}
`;

interface BetData {
  betId: number;
  bettor: string;
  amount: number;
  duration: number;
  expiresAt: number;
  entryPrice: number;
  baseToken: string;
  isUp: boolean;
  isResolved: boolean;
  won: boolean;
}

const useBetHistory = () => {
  const { user } = useFlowCurrentUser();
  const { data, isLoading, isRefetching, refetch, error } = useFlowQuery({
    cadence: GET_BET_HISTORY_SCRIPT,
    args: (arg, t) => [arg(user?.addr || "", t.Address)],
  });
  return {
    data: data as string[] | undefined,
    isLoading,
    isRefetching,
    refetch,
    error
  };
};

const useGetBetDetail = (betId: number) => {
  const { data, isLoading, isRefetching, refetch, error } = useFlowQuery({
    cadence: GET_BET_DETAIL_SCRIPT,
    args: (arg, t) => [arg(betId, t.UInt64)],
  });
  return {
    data: data as BetData | undefined,
    isLoading,
    isRefetching,
    refetch,
    error,
  };
};

export { useBetHistory, useGetBetDetail, type BetData };
