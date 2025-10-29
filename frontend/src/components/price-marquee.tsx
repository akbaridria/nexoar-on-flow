import { useBandPrices } from "@/hooks/use-band-prices";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SYMBOLS } from "@/config/constant";

interface PriceItem {
  symbol: string;
  price: number;
}

export const PriceMarquee = () => {
  const { data: prices, isLoading, isError } = useBandPrices(SYMBOLS);

  if (isLoading) {
    return <PriceMarqueeSkeleton />;
  }

  if (isError || !prices) {
    return <PriceMarqueeError />;
  }

  const marqueeItems = [...prices, ...prices];

  return (
    <Card className="w-full py-2 overflow-hidden text-white border-none">
      <div className="py-2">
        <div className="flex animate-marquee whitespace-nowrap">
          {marqueeItems.map((item, index) => (
            <PriceTag key={`${item.symbol}-${index}`} {...item} />
          ))}
        </div>
      </div>
    </Card>
  );
};

const PriceTag = ({ symbol, price }: PriceItem) => {
  const formatted = formatCurrency(price);

  return (
    <div className="inline-flex items-center gap-2 mx-6 text-sm font-medium">
      <span className="font-bold text-primary">{symbol}</span>
      <span className="text-muted-foreground">${formatted}</span>
      <span className="text-muted">•</span>
    </div>
  );
};

const PriceMarqueeSkeleton = () => (
  <Card className="w-full py-2 overflow-hidden border-none bg-card">
    <div className="flex items-center h-full px-4 space-x-8 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-5 w-24 bg-muted/50 rounded-md" />
      ))}
    </div>
  </Card>
);

const PriceMarqueeError = () => (
  <Card className="w-full bg-destructive border-destructive/20 py-2">
    <div className="flex items-center justify-center gap-2 text-sm">
      <AlertCircle className="w-4 h-4 text-destructive-foreground" />
      <span className="text-destructive-foreground font-medium">
        Failed to load prices
      </span>
    </div>
  </Card>
);
