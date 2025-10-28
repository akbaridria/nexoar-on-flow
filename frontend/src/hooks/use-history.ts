import FlowJson from "@/flow.json";
import { useFlowCurrentUser, useFlowQuery } from "@onflow/react-sdk";

const GET_HISTORY_SCRIPT = `
import NexoarCore from 0x${FlowJson.accounts["nexoar-on-flow"].address}

access(all)
fun main(address: Address): [UInt64] {
    return NexoarCore.getUserOptions(address: address): 
}
`;

const GET_DETAIL_OPTION_SCRIPT = `
import NexoarCore from 0x${FlowJson.accounts["nexoar-on-flow"].address}

access(all)
fun main(optionId: UInt64): OptionsData? {
    return NexoarCore.getDetailOptionsData(optionId: optionId):
}
`;

type OptionHistory = {
  optionId: number;
  owner: string;
  strike: number;
  expiry: number;
  size: number;
  isCall: boolean;
  premium: number;
  lockedLiquidity: number;
  isExercised: boolean;
  profit: number;
  exercisePrice: number;
};

const useHistory = () => {
  const { user } = useFlowCurrentUser();
  const { data, isLoading } = useFlowQuery({
    cadence: GET_HISTORY_SCRIPT,
    args: (arg, t) => [arg(user?.addr || "", t.Address)],
  });
  return {
    history: data as number[] | undefined,
    isLoading,
  };
};

const useDetailOption = (optionId: number) => {
  const { data, isLoading } = useFlowQuery({
    cadence: GET_DETAIL_OPTION_SCRIPT,
    args: (arg, t) => [arg(optionId, t.UInt64)],
  });
  return {
    option: data as OptionHistory | undefined,
    isLoading,
  };
};

export { useHistory, useDetailOption, type OptionHistory };
