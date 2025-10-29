import { PriceMarquee } from "@/components/price-marquee";
import PlaceBet from "./components/place-bet";
import BetHistory from "./components/bet-history";

const Flashbet = () => {
  return (
    <div className="space-y-4">
      <PriceMarquee />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PlaceBet />
        <BetHistory />
      </div>
    </div>
  );
};

export default Flashbet;
