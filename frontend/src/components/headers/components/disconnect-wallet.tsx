import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFlowCurrentUser } from "@onflow/react-sdk";
import { UnplugIcon } from "lucide-react";

const DisconnectWallet = () => {
  const { unauthenticate } = useFlowCurrentUser();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={unauthenticate}>
          <UnplugIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Disconnect Wallet</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default DisconnectWallet;
