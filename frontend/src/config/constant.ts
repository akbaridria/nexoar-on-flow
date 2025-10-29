import { TAB_ITEMS, type TabItem } from "@/types";
import type { FlowConfig } from "@onflow/react-sdk/types/core/context";
import {
  DropletsIcon,
  HistoryIcon,
  SquareMenuIcon,
  ZapIcon,
} from "lucide-react";

export const LIST_TABS: Array<{
  key: TabItem;
  label: string;
  icon: React.FC;
  path: string;
}> = [
  {
    key: TAB_ITEMS.CREATE_OPTIONS,
    label: "Create Options",
    icon: SquareMenuIcon,
    path: "/",
  },
  {
    key: TAB_ITEMS.FLASHBET,
    label: "Flash Bet",
    icon: ZapIcon,
    path: "/flashbet",
  },
  {
    key: TAB_ITEMS.MANAGE_LIQUIDITY,
    label: "Manage Liquidity",
    icon: DropletsIcon,
    path: "/manage-liquidity",
  },
  {
    key: TAB_ITEMS.OPTIONS_HISTORY,
    label: "History",
    icon: HistoryIcon,
    path: "/options-history",
  },
];

export const SYMBOLS = [
  "ETH",
  "FLOW",
  "USDC",
  "USDT",
  "WBTC",
  "BNB",
  "XRP",
  "ADA",
  "DOGE",
];

export const NETWORK_CONFIG: FlowConfig = {
  accessNodeUrl: "https://rest-testnet.onflow.org",
  discoveryWallet: "https://fcl-discovery.onflow.org/testnet/authn",
  discoveryAuthnEndpoint: "https://fcl-discovery.onflow.org/api/testnet/authn",
  flowNetwork: "testnet",
  appDetailTitle: "Nexoar",
  appDetailUrl: typeof window !== "undefined" ? window.location.origin : "",
  walletconnectProjectId: "183dd8548e76520612b2996b93ecf463"
};
