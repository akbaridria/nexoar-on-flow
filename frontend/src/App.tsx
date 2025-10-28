"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { RouterProvider } from "react-router";
import router from "@/routes";
import { FlowProvider } from "@onflow/react-sdk";
import { NETWORK_CONFIG } from "@/config/constant";
import WalletConnection from "@/components/wallet-connection";

const App = () => {
  return (
    <FlowProvider config={NETWORK_CONFIG}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <WalletConnection />
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </FlowProvider>
  );
};

export default App;
