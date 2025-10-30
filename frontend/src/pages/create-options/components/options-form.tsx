import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, PlusIcon, MinusIcon } from "lucide-react";
import { DURATION_OPTIONS, SYMBOLS } from "@/config/constant";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useMemo } from "react";
import { useBandPrices } from "@/hooks/use-band-prices";
import { OptionsPricing } from "@/classes/options-pricing";
import useCreateOptions from "@/hooks/use-create-option";
import { toast } from "sonner";

interface OptionFormProps {
  market: string;
  strikePrice: string;
  duration: number;
  size: number;
  optionType: string;
  handleChangeForm: (type: string, value: any) => void;
}

const OptionForm: React.FC<OptionFormProps> = ({
  market,
  duration,
  size,
  optionType,
  strikePrice,
  handleChangeForm,
}) => {
  const { data } = useBandPrices(SYMBOLS);

  const { createOptions, isPending, reset } = useCreateOptions();

  const handleCreateOptions = useCallback(() => {
    createOptions({
      strikePrice: parseFloat(strikePrice).toFixed(8),
      days: duration,
      isCall: optionType === "call",
      size,
      tokenSymbol: market,
    })
      .then((res) => {
        toast.success("Success creationg options", {
          action: {
            label: "View on explorer",
            onClick: () => window.open(`https://testnet.flowscan.io/tx/${res}`),
          },
        });
        setTimeout(() => {
          reset();
        }, 300);
      })
      .catch(() => {
        toast.error("Failed to create options");
      });
  }, [strikePrice, duration, size, market, optionType, reset, createOptions]);

  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (
        value === "" ||
        (parseInt(value) >= 1 && Number.isInteger(Number(value)))
      ) {
        handleChangeForm("siz", value === "" ? 1 : parseInt(value));
      }
    },
    [handleChangeForm]
  );

  const selectedPrice = useMemo(() => {
    return data?.find((item) => item.symbol === market)?.price;
  }, [market, data]);

  const premium = useMemo(() => {
    const optPricing = new OptionsPricing();
    if (selectedPrice && strikePrice && duration && optionType) {
      return optPricing.calculatePremium(
        selectedPrice,
        parseFloat(strikePrice),
        duration,
        optionType === "call"
      );
    }
    return undefined;
  }, [selectedPrice, strikePrice, duration, optionType]);

  const isInTheMoney = useMemo(() => {
    if (selectedPrice) {
      return optionType === "call"
        ? selectedPrice > parseFloat(strikePrice)
        : selectedPrice < parseFloat(strikePrice);
    }
    return false;
  }, [selectedPrice, optionType, strikePrice]);

  return (
    <Card className="w-full md:max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Create Options</CardTitle>
        <CardDescription>
          Configure your options trade for BTC/USD market
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="market">Market</Label>
          <Select
            value={market}
            onValueChange={(e) => handleChangeForm("market", e)}
          >
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

        <div className="grid gap-2">
          <Label>Option Type</Label>
          <div className="grid grid-cols-2 gap-4">
            {["call", "put"].map((type) => (
              <div
                key={type}
                onClick={() => handleChangeForm("optionType", type)}
                className={`cursor-pointer rounded-lg border p-4 transition-all ${
                  optionType === type ? "bg-input/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-3 w-3 rounded-full border-2 flex items-center justify-center`}
                  >
                    {optionType === type && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {type === "call" ? (
                        <TrendingUp className="h-4 w-4 text-primary" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-secondary" />
                      )}
                      <span className="font-semibold text-sm">
                        {type === "call" ? "Call Option" : "Put Option"}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {type === "call"
                        ? "Profit when price goes up."
                        : "Profit when price goes down."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="strikePrice">Strike Price (USD)</Label>
          <Input
            id="strikePrice"
            type="number"
            step="0.01"
            placeholder="Enter strike price"
            value={strikePrice}
            onChange={(e) => {
              handleChangeForm("strikePrice", e.target.value);
            }}
          />
          {strikePrice && (
            <span
              className={`flex items-center gap-1 text-xs ${
                isInTheMoney
                  ? "text-primary font-semibold"
                  : "text-secondary font-semibold"
              }`}
            >
              {isInTheMoney ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  In the money
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  Out of the money
                </>
              )}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Duration</Label>
          <div className="grid grid-cols-4 gap-2">
            {DURATION_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={duration === option.value ? "default" : "outline"}
                onClick={() => handleChangeForm("duration", option.value)}
                className="w-full"
                size="sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-end gap-2 w-full">
          <Button
            size="icon"
            variant="ghost"
            disabled={size <= 1}
            onClick={() => handleChangeForm("size", size - 1)}
          >
            <MinusIcon />
          </Button>
          <div className="grid gap-2 flex-1">
            <Label htmlFor="size">Size (Minimum: 1)</Label>
            <Input
              id="size"
              type="number"
              min="1"
              step="1"
              placeholder="Enter size"
              className="pointer-events-none"
              value={size}
              onChange={handleSizeChange}
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleChangeForm("size", size + 1)}
          >
            <PlusIcon />
          </Button>
        </div>
        <div className="bg-input/50 p-4 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Premium</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {premium !== undefined
                  ? (premium * size).toLocaleString()
                  : "N/A"}
              </span>
              <span className="text-xs text-muted-foreground">USDA</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleCreateOptions}
          disabled={isPending}
        >
          Create Options
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OptionForm;
