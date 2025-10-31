import FlowJson from "@/flow.json";
import { useFlowCurrentUser, useFlowQuery } from "@onflow/react-sdk";

const GET_HISTORY_SCRIPT = `
import NexoarCoreV3 from 0x${FlowJson.accounts["nexoar-on-flow"].address}

access(all)
fun main(address: Address): [UInt64] {
    return NexoarCoreV3.getUserOptions(address: address)
}
`;

const GET_DETAIL_OPTION_SCRIPT = `
import NexoarCoreV3 from 0x${FlowJson.accounts["nexoar-on-flow"].address}

access(all)
fun main(optionId: UInt64): NexoarCoreV3.OptionsData? {
    return NexoarCoreV3.getDetailOptionsData(optionId: optionId)
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
  const { data, isLoading, error } = useFlowQuery({
    cadence: GET_HISTORY_SCRIPT,
    args: (arg, t) => [arg(user?.addr || "", t.Address)],
  });
  return {
    history: data as number[] | undefined,
    isLoading,
    error,
  };
};

const useDetailOption = (optionId: number) => {
  const { data, isLoading, error } = useFlowQuery({
    cadence: GET_DETAIL_OPTION_SCRIPT,
    args: (arg, t) => [arg(optionId, t.UInt64)],
  });

  console.log(error, "<<< error")
  return {
    option: data as OptionHistory | undefined,
    isLoading,
  };
};

export { useHistory, useDetailOption, type OptionHistory };
