import Header from "@/components/headers";
// import WalletConnection from "@/components/wallet-connection";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <main className="container mx-auto">
      <Header />
      {/* <WalletConnection /> */}
      <Outlet />
    </main>
  );
};

export default Layout;
