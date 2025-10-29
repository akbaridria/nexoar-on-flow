import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SYMBOLS } from "@/config/constant";
import usePlaceBet from "@/hooks/use-place-bet";
import { toast } from "sonner";

const PlaceBet = () => {
  const [betDirection, setBetDirection] = useState<"up" | "down">("up");
  const [betDuration, setBetDuration] = useState<number>(120);
  const [betAmount, setBetAmount] = useState<string>("");
  const [market, setMarket] = useState<string>("FLOW");

  const DURATION_OPTIONS = [
    { label: "2 Minutes", value: 120 },
    { label: "5 Minutes", value: 300 },
    { label: "7 Minutes", value: 420 },
    { label: "10 Minutes", value: 600 },
  ];

  const { placeBet, reset, isPending } = usePlaceBet();

  const handlePlaceBet = useCallback(() => {
    placeBet({
      duration: betDuration,
      amount: parseFloat(betAmount),
      baseToken: market,
      isBetUp: betDirection === "up",
    })
      .then((res) => {
        toast.success("Bet placed successfully!", {
          action: {
            label: "View on Explorer",
            onClick: () => window.open(`https://testnet.flowscan.io/tx/${res}`),
          },
        });
        setTimeout(() => {
          reset();
          setBetAmount("");
          setMarket("FLOW");
          setBetDuration(120);
          setBetDirection("up");
        }, 300);
      })
      .catch((err) => {
        console.log("Error placing bet", err);
        toast.error("Failed to place bet");
      });
  }, [betDuration, betAmount, market, betDirection, placeBet, reset]);

  return (
    <div className="p-4 bg-card rounded-lg border  space-y-4">
      <div className="flex flex-col">
        <div className="text-lg font-semibold">Place Your Bet</div>
        <div className="text-xs text-muted-foreground">
          Enter your trading position
        </div>
      </div>
      <div className="space-y-2">
        <Label>Direction</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={betDirection === "up" ? "default" : "outline"}
            onClick={() => setBetDirection("up")}
            className="transition-all duration-300"
          >
            <TrendingUpIcon className="mr-2 h-4 w-4" />
            Up
          </Button>
          <Button
            variant={betDirection === "down" ? "destructive" : "outline"}
            onClick={() => setBetDirection("down")}
            className="transition-all duration-300"
          >
            <TrendingDownIcon className="mr-2 h-4 w-4" />
            Down
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="duration">Duration</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {DURATION_OPTIONS.map((option) => (
            <div
              key={option.label}
              className={cn(
                "bg-input/20 border rounded-lg px-4 py-1 hover:bg-input/30 hover:border-primary transition-colors cursor-pointer",
                {
                  "border-primary bg-input/30": betDuration === option.value,
                }
              )}
              onClick={() => setBetDuration(option.value)}
            >
              <span className="text-sm font-medium">{option.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            max={1000}
            min={2}
          />
          <div className="grid grid-cols-2 gap-6">
            <p className="text-xs text-red-500">
              {betAmount && parseFloat(betAmount) > 1000
                ? "Maximum bet amount is 1000"
                : betAmount && parseFloat(betAmount) < 2
                ? "Minimum bet amount is 2"
                : ""}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="market">Market</Label>
          <Select value={market} onValueChange={setMarket}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a market" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Markets</SelectLabel>
                {SYMBOLS.map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Potential Profit</span>
          <span className="font-medium text-green-400">
            +${betAmount ? (parseFloat(betAmount) * 1.75).toFixed(2) : "0.00"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Multiplier</span>
          <span className="font-medium">1.75x</span>
        </div>
      </div>
      <Button
        variant="secondary"
        className="w-full"
        onClick={handlePlaceBet}
        disabled={!betAmount || isPending}
      >
        Place Bet
      </Button>
    </div>
  );
};

export default PlaceBet;
