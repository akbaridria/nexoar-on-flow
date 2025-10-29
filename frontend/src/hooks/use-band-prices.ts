// hooks/useBandPrices.ts
import { useQuery } from "@tanstack/react-query";

interface BandPriceRaw {
  symbol: string;
  multiplier: string;
  px: string;
  request_id: string;
  resolve_time: string;
}

interface BandPrice {
  symbol: string;
  price: number;
}

const BAND_API_BASE =
  "https://laozi3.bandchain.org/api/oracle/v1/request_prices";
const MIN_COUNT = 10;
const ASK_COUNT = 16;

const fetchBandPrices = async (symbols: string[]): Promise<BandPrice[]> => {
  if (!symbols || symbols.length === 0) return [];

  const searchParams = new URLSearchParams({
    min_count: MIN_COUNT.toString(),
    ask_count: ASK_COUNT.toString(),
  });

  symbols.forEach((symbol) => {
    searchParams.append("symbols", symbol);
  });

  const url = `${BAND_API_BASE}?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch prices: ${response.statusText}`);
  }

  const data: { price_results: BandPriceRaw[] } = await response.json();

  return data.price_results.map((item) => {
    const multiplier = BigInt(item.multiplier);
    const px = BigInt(item.px);
    const price = Number(px) / Number(multiplier);
    return {
      symbol: item.symbol,
      price,
    };
  });
};

export const useBandPrices = (symbols: string[]) => {
  return useQuery<BandPrice[], Error>({
    queryKey: ["band-prices", symbols],
    queryFn: () => fetchBandPrices(symbols),
    enabled: symbols.length > 0,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
};
