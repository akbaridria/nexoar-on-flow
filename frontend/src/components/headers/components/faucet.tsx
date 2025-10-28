import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useFaucet from "@/hooks/use-faucet";
import { CheckIcon, DropletIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

const Faucet = () => {
  const [open, setOpen] = useState(false);
  const { faucet, isPending, isSuccess, error, data, reset } = useFaucet();

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        reset();
      }, 300);
    }
  }, [open]);

  const renderSuccess = () => (
    <>
      <DialogHeader>
        <DialogTitle>Success!</DialogTitle>
        <DialogDescription>
          Your request for mock USDC has been successfully processed.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckIcon className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-sm text-muted-foreground">
          10,000 Mock USDC has been sent to your wallet.
        </p>
      </div>
      <DialogFooter className="gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.open(`https://testnet.flowscan.io/tx/${data}`)}
        >
          View on Explorer
        </Button>
        <Button
          variant="default"
          className="flex-1"
          onClick={() => setOpen(false)}
        >
          Done
        </Button>
      </DialogFooter>
    </>
  );

  const renderError = () => (
    <>
      <DialogHeader>
        <DialogTitle>Failed!</DialogTitle>
        <DialogDescription>
          There was an error processing your request.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <XIcon className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-sm text-muted-foreground">
          {error?.message || "An unknown error occurred."}
        </p>
      </div>
      <DialogFooter>
        <Button
          variant="default"
          className="w-full"
          onClick={() => setOpen(false)}
        >
          Close
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <DropletIcon />
          <div className="hidden md:block">Faucet</div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isSuccess ? (
          renderSuccess()
        ) : error ? (
          renderError()
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Faucet Mock USDC</DialogTitle>
              <DialogDescription>
                Request test USDC tokens for development and testing.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 border rounded-xl bg-input/20 flex items-center justify-between">
              <div>Amount</div>
              <div>10,000</div>
            </div>
            <DialogFooter>
              <Button
                variant="default"
                className="w-full"
                onClick={faucet}
                disabled={isPending}
              >
                {isPending ? "Requesting..." : "Request"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Faucet;
