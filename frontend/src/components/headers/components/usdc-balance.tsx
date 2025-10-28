import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useGetUSDC from "@/hooks/use-get-usdc";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";

const USDCBalance = () => {
  const { balance, error, isLoading, isRefetching, refetch } = useGetUSDC();
  const formattedBalance = useMemo(() => {
    return formatCurrency(balance);
  }, [balance]);

  console.log("USDC Balance:", balance, error, isLoading);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => {
            refetch();
          }}
        >
          <div className="w-4 h-4 aspect-square bg-primary rounded-full flex items-center justify-center text-xs text-background">
            $
          </div>
          {isLoading || isRefetching ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <div className="text-sm">{formattedBalance}</div>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Your mock USDC Balance</p>
      </TooltipContent>
    </Tooltip>
  );
};
export default USDCBalance;
