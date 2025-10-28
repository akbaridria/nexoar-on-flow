import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GithubIcon } from "lucide-react";

const GithubNexoar = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon">
          <GithubIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">View on Github</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default GithubNexoar;
