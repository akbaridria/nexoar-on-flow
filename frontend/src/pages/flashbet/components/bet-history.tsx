import {
  Activity,
  TimerIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { useBetHistory, useGetBetDetail } from "@/hooks/use-bet-history";

export interface BetInfo {
  amount: string;
  entry_price: string;
  entry_time: string;
  expiry_time: string;
  id: string;
  is_long: boolean;
  resolver: string;
  status: Status;
  user: string;
  won: boolean;
}

export interface Status {
  __variant__: "Pending" | "Resolved" | "Cancelled";
}

const ItemActivity: React.FC<{ betId: number }> = ({ betId }) => {
  const { data: betDetail, error } = useGetBetDetail(betId);
  console.log("betDetail", betDetail);
  console.log("error", error);

  if (!betDetail) return null;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-accent">
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {betDetail?.isUp ? (
              <TrendingUpIcon className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDownIcon className="h-4 w-4 text-red-400" />
            )}
            <div>
              <p className="text-sm font-medium">
                {formatCurrency(betDetail.amount)}
                <sub className="text-xs"> usdc</sub>
              </p>
              <p className="text-xs text-muted-foreground">
                {betDetail.expiresAt
                  ? format(
                      new Date(Number(betDetail.expiresAt) * 1000),
                      "MMM d, HH:mm"
                    )
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={betDetail.isResolved ? "default" : "outline"}>
              {betDetail.isResolved ? "Resolved" : "Pending"}
            </Badge>
            <div className="text-right">
              <p
                className={`text-sm font-medium ${
                  !betDetail.isResolved
                    ? "text-yellow-400"
                    : betDetail.isResolved
                    ? betDetail.won
                      ? "text-green-400"
                      : "text-red-400"
                    : "text-muted-foreground"
                }`}
              >
                {!betDetail.isResolved
                  ? "-"
                  : betDetail.isResolved
                  ? betDetail.won
                    ? `+${formatCurrency(betDetail.amount * 1.75)}`
                    : `-${formatCurrency(betDetail.amount)}`
                  : "-"}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TimerIcon className="h-3 w-3" />
                {betDetail?.expiresAt
                  ? formatDistanceToNow(
                      new Date(Number(betDetail.expiresAt) * 1000),
                      {
                        addSuffix: true,
                      }
                    )
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentActivity = () => {
  const { data: userBets, error } = useBetHistory();
  console.log("userBets", userBets);
  console.log("error", error);

  const listBets = userBets || [];

  const hasNoBets = !listBets || listBets.length === 0;

  return (
    <div className="p-4 bg-card rounded-lg border space-y-4 h-fit">
      <div>
        <div className="text-lg font-semibold">Recent Activity</div>
        <div className="text-xs text-muted-foreground">
          View your recent bets
        </div>
      </div>

      {hasNoBets ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <div className="p-3 bg-muted rounded-full">
            <Activity className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground">
              Your betting history will appear here once you place your first
              bet
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {listBets
            ?.slice()
            .reverse()
            .map((betId: string) => (
              <ItemActivity key={betId} betId={Number(betId)} />
            ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
