import { useFlowCurrentUser } from "@onflow/react-sdk";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WalletConnection = () => {
  const { user, authenticate } = useFlowCurrentUser();
  console.log("Current User:", user);
  if (user?.addr) return null;

  return (
    <div className="absolute z-100 top-0 left-0 w-full h-full bg-background/50 pointer-events-auto transition-opacity backdrop-blur-sm">
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              <p className="text-sm">
                Please connect your wallet before interacting with{" "}
                <span className="font-semibold">Nexoar</span>
              </p>
            </CardDescription>
            <Button className="w-full" onClick={authenticate}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletConnection;
