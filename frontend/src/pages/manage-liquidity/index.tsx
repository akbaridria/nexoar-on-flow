import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { DropletIcon, LockIcon, RefreshCw, UnlockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetPoolInfo, useGetProviderBalance } from "@/hooks/use-get-nexoar";
import { formatCurrency } from "@/lib/utils";
import AddLiquidity from "./components/add-liquidity";
import RemoveLiquidity from "./components/remove-liquidity";

const ManageLiquidity = () => {
  const { poolInfo, isLoading: isLoadingPoolInfo } = useGetPoolInfo();
  const {
    balance,
    isLoading: isLoadingBalace,
    isRefetching: isRefetchingBalance,
    refetch: refetchBalance,
  } = useGetProviderBalance();

  console.log(poolInfo, "<<<< POOL INFO");
  console.log(balance, "<<<< PROVIDER BALANCE");

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 h-full md:p-4 mt-0 md:mt-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Total Liquidity</CardTitle>
            <CardAction>
              <DropletIcon className="h-6 w-6 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPoolInfo ? <Spinner /> : formatCurrency(poolInfo?.totalLiquidity)}
              <sub className="text-xs ml-1">mUSDA</sub>
            </div>
            <p className="text-xs text-muted-foreground">Total Liquidity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Available Liquidity</CardTitle>
            <CardAction>
              <UnlockIcon className="h-6 w-6 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPoolInfo ? <Spinner /> : formatCurrency(poolInfo?.availableLiquidity)}
              <sub className="text-xs ml-1">mUSDA</sub>
            </div>
            <p className="text-xs text-muted-foreground">
              Total Available Liquidity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Locked Liquidity</CardTitle>
            <CardAction>
              <LockIcon className="h-6 w-6 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingPoolInfo ? <Spinner /> : formatCurrency(poolInfo?.lockedLiquidity)}
              <sub className="text-xs ml-1">mUSDA</sub>
            </div>
            <p className="text-xs text-muted-foreground">
              Total Locked Liquidity
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="p-4 bg-card rounded-lg space-y-4 w-full max-w-2xl">
        <CardHeader className="p-0">
          <CardTitle className="text-lg font-semibold">
            Manage Liquidity
          </CardTitle>
          <CardDescription>
            View and manage your liquidity in the vault
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          <div className="rounded-lg border p-4 flex flex-col items-start bg-input/50 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => refetchBalance()}
              disabled={isLoadingBalace}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLoadingBalace || isRefetchingBalance ? "animate-spin" : ""
                }`}
              />
            </Button>

            {isLoadingBalace || isRefetchingBalance ? (
              <Spinner className="w-8 h-8" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(balance)}
                <sub className="text-xs ml-1">mUSDA</sub>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Your total liquidity
            </p>
          </div>
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Liquidity</TabsTrigger>
              <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="pt-4">
              <AddLiquidity />
            </TabsContent>

            <TabsContent value="remove" className="pt-4">
              <RemoveLiquidity />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageLiquidity;
