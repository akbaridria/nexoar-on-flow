import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { OptionsPricing } from "@/classes/options-pricing";
import { useBandPrices } from "@/hooks/use-band-prices";
import { SYMBOLS } from "@/config/constant";

export const description = "Profit vs Spot Price for BTC Option";

function generateSpotPrices(current: number, strike?: number) {
  const max = 2 * Math.max(current, strike ?? 0);
  const min = 0;
  const step = (max - min) / 40;
  const prices: number[] = [];
  for (let i = 0; i <= 40; i++) {
    prices.push(Math.round(min + step * i));
  }
  return prices;
}

function calculateProfit(
  spot: number,
  strike: number,
  size: number,
  type: string,
  premium: number
): number {
  if (type === "call") {
    return Math.max(0, spot - strike) * size - (premium * size);
  } else {
    return Math.max(0, strike - spot) * size - (premium * size);
  }
}

const chartConfig = {
  profitPositive: {
    label: "Profit",
    color: "var(--chart-1)",
  },
  profitNegative: {
    label: "Loss",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface OptionsVisualizationProps {
  market: string;
  strikePrice: string;
  duration: number;
  size: number;
  optionType: string;
}

const OptionVisualization: React.FC<OptionsVisualizationProps> = ({
  market,
  duration,
  size,
  optionType,
  strikePrice,
}) => {
  const { data } = useBandPrices(SYMBOLS);

  const currentPrice = useMemo(() => {
    if (market && data) {
      return data?.find((item) => item.symbol === market)?.price;
    }
    return undefined;
  }, [market, data]);

  const allParamsAvailable = useMemo(() => {
    return strikePrice && currentPrice && size && optionType;
  }, [strikePrice, currentPrice, size, optionType]);

  if (!allParamsAvailable) {
    return (
      <Card className="pt-0 flex-1 h-full">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Option Profit Visualization</CardTitle>
            <CardDescription>
              Fill the option form to see profit visualization.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex items-center justify-center h-[350px] max-w-md mx-auto">
          <span className="text-muted-foreground text-center">
            Please fill all option parameters (type, strike price, current
            price, size) to view the profit chart.
          </span>
        </CardContent>
      </Card>
    );
  }

  const optionsPricing = new OptionsPricing();

  const spotPrices = generateSpotPrices(currentPrice!, Number(strikePrice));
  const chartData = spotPrices.map((spot) => {
    const premium = optionsPricing.calculatePremium(
      currentPrice!,
      Number(strikePrice)!,
      duration,
      optionType === "call"
    );
    const profit = calculateProfit(
      spot,
      Number(strikePrice)!,
      size!,
      optionType!,
      premium
    );

    return {
      spot,
      profit,
      profitPositive: profit > 0 ? profit : 0,
      profitNegative: profit < 0 ? profit : 0,
    };
  });

  return (
    <Card className="pt-0 flex-1 h-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Option Profit Visualization</CardTitle>
          <CardDescription>
            Profit and loss calculation based on option type, size, strike
            price, and premium paid. Real profit = profit - premium.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="fillProfitPositive"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillProfitNegative"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="spot"
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              domain={[
                Math.min(...spotPrices, Number(strikePrice)!),
                Math.max(...spotPrices, Number(strikePrice)!),
              ]}
              tickFormatter={(value) =>
                value.toLocaleString("en-US", { maximumFractionDigits: 0 })
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideIndicator hideLabel />}
            />
            <Area
              dataKey="profitPositive"
              type="natural"
              fill="url(#fillProfitPositive)"
              stroke="var(--chart-1)"
              stackId="a"
              connectNulls
            />
            <Area
              dataKey="profitNegative"
              type="natural"
              fill="url(#fillProfitNegative)"
              stroke="none"
              stackId="a"
              connectNulls
            />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine
              x={strikePrice}
              stroke="#e78a53"
              strokeDasharray="3 3"
              label={{
                value: `Strike Price: ${strikePrice?.toLocaleString()}`,
                position: "insideTop",
                fill: "#e78a53",
                fontWeight: 600,
              }}
            />
            <ReferenceLine
              x={currentPrice}
              stroke="#5f8787"
              strokeDasharray="3 3"
              label={{
                value: `Current Price: ${currentPrice?.toLocaleString()}`,
                position: "center",
                fill: "#5f8787",
                fontWeight: 600,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default OptionVisualization;
