// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import OptionForm from "./components/option-form";
// import OptionVisualization from "./components/option-visualization";
import { PriceMarquee } from "@/components/price-marquee";
import OptionForm from "./components/options-form";
import { useCallback, useState } from "react";
import { DURATION_OPTIONS } from "@/config/constant";
import OptionVisualization from "./components/options-visualization";

const CreateOptions = () => {
  const [market, setMarket] = useState("FLOW");
  const [optionType, setOptionsType] = useState("call");
  const [strikePrice, setStrikePrice] = useState("");
  const [duration, setDuration] = useState(DURATION_OPTIONS[0].value);
  const [size, setSize] = useState(1);

  const handleChangeForm = useCallback((type: string, value: any) => {
    console.log(type, value);
    switch (type) {
      case "market":
        setMarket(value);
        break;
      case "optionType":
        setOptionsType(value);
        break;
      case "strikePrice":
        setStrikePrice(value);
        break;
      case "duration":
        setDuration(value);
        break;
      case "size":
        setSize(value);
        break;
      default:
        break;
    }
  }, []);
  return (
    <div className="space-y-4">
      <PriceMarquee />
      <div className="mt-0 md:mt-8 p-4 md:p-0 flex gap-8 flex-col md:flex-row">
        <OptionForm
          market={market}
          optionType={optionType}
          strikePrice={strikePrice}
          duration={duration}
          size={size}
          handleChangeForm={handleChangeForm}
        />
        <OptionVisualization
          market={market}
          optionType={optionType}
          strikePrice={strikePrice}
          duration={duration}
          size={size}
        />
      </div>
    </div>
  );
};

export default CreateOptions;
