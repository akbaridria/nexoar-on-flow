import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddLiquidity } from "@/hooks/use- manage-liquidity";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const AddLiquidity = () => {
  const { addLiquidity, isPending, reset } = useAddLiquidity();
  const [amount, setAmount] = useState("");

  const handleAddLiquidity = useCallback(() => {
    addLiquidity(amount.includes('.') ? amount : amount + '.0')
      .then((res) => {
        toast.success("Liquidity added successfully!", {
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
        console.log("Error adding liquidity", err);
        toast.error("Failed to add liquidity");
      });
  }, [amount]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="add-amount">Amount</Label>
        <Input
          id="add-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p className="text-xs">Enter the amount of mUSDA to add</p>
      </div>
      <Button
        variant="default"
        className="w-full"
        size="lg"
        onClick={handleAddLiquidity}
        disabled={!amount || Number(amount) <= 0 || isPending}
      >
        <Plus />
        Add Liquidity
      </Button>
    </div>
  );
};

export default AddLiquidity;
