import { LIST_TABS } from "@/config/constant";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import Faucet from "./components/faucet";
import { Separator } from "@/components/ui/separator";
import USDCBalance from "./components/usdc-balance";
import DisconnectWallet from "./components/disconnect-wallet";
import GithubNexoar from "./components/github-nexoar";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between sticky z-10 top-0 bg-background px-4 py-6">
      <div className="flex items-center gap-4">
        <img src="/nexoar.svg" alt="Nexoar Logo" className="w-6 h-6" />
        <div className="flex items-center gap-2">
          {LIST_TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={location.pathname === tab.path ? "outline" : "ghost"}
              onClick={() => navigate(tab.path)}
            >
              {<tab.icon />}
              <span className="hidden md:inline">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Faucet />
        <Separator orientation="vertical" className="h-5!" />
        <span className="hidden md:inline-flex">
          <USDCBalance />
          <Separator orientation="vertical" className="h-5!" />
        </span>
        <a
          href="https://github.com/akbaridria/nexoar-on-flow"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubNexoar />
        </a>
        <Separator orientation="vertical" className="h-5!" />
        <DisconnectWallet />
      </div>
    </div>
  );
};

export default Header;
