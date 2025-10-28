import Layout from "@/layouts";
import CreateOptions from "@/pages/create-options";
import ManageLiquidity from "@/pages/manage-liquidity";
import OptionsHistory from "@/pages/options-history";
import Flashbet from "@/pages/flashbet";
import { createBrowserRouter, Navigate } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <CreateOptions /> },
      { path: "flashbet", element: <Flashbet /> },
      { path: "manage-liquidity", element: <ManageLiquidity /> },
      { path: "options-history", element: <OptionsHistory /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
