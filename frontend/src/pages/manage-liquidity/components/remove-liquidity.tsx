import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRemoveLiquidity } from "@/hooks/use- manage-liquidity";
import { useGetProviderBalance } from "@/hooks/use-get-nexoar";
import { formatCurrency } from "@/lib/utils";
import { CircleAlertIcon, Minus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const RemoveLiquidity = () => {
  const [amount, setAmount] = useState("");

  const { balance } = useGetProviderBalance();
  const { removeLiquidity, isPending, reset } = useRemoveLiquidity();

  const handleRemoveLiquidity = useCallback(() => {
    removeLiquidity(amount.includes(".") ? amount : amount + ".0")
      .then((res) => {
        toast.success("Liquidity removed successfully!", {
          action: {
            label: "View on Explorer",
            onClick: () => window.open(`https://testnet.flowscan.io/tx/${res}`),
          },
        });
        setTimeout(() => {
          reset();
        }, 300);
      })
      .catch((err) => {
        console.log("Error removing liquidity", err);
        toast.error("Failed to remove liquidity");
      });
  }, [amount]);

  return (
    <div className="space-y-4">
      <Alert>
        <CircleAlertIcon />
        <AlertTitle>Withdrawal Info</AlertTitle>
        <AlertDescription>
          If the total available liquidity is lower than the amount you want to
          withdraw, you must wait until the option is exercised to release
          liquidity.
        </AlertDescription>
      </Alert>
      <div className="space-y-2">
        <Label htmlFor="remove-amount">Amount</Label>
        <Input
          id="remove-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p className="text-xs">
          Available: {balance ? formatCurrency(balance) : 0} mUSDA
        </p>
      </div>
      <Button
        variant="default"
        size="lg"
        className="w-full"
        disabled={isPending}
        onClick={handleRemoveLiquidity}
      >
        <Minus className="w-4 h-4" />
        Remove Liquidity
      </Button>
    </div>
  );
};

export default RemoveLiquidity;
