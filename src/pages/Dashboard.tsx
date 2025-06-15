
import { useTrades } from "@/hooks/useTrades";
import { useMemo } from "react";
import { isToday, parseISO, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const StatCard = ({ title, value, valueClassName, description, children }: { title: string, value: React.ReactNode, valueClassName?: string, description?: string, children?: React.ReactNode }) => (
  <div className="bg-card shadow rounded-lg p-3 sm:p-4 flex flex-col">
    <span className="text-sm sm:text-lg font-bold text-card-foreground">{title}</span>
    <span className={cn("text-xl sm:text-2xl font-mono", valueClassName)}>{value}</span>
    {description && <span className="text-xs sm:text-sm text-muted-foreground">{description}</span>}
    {children}
  </div>
);

const DashboardSkeleton = () => (
  <>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <Skeleton className="h-20 sm:h-24" />
      <Skeleton className="h-20 sm:h-24" />
      <Skeleton className="h-20 sm:h-24" />
      <Skeleton className="h-20 sm:h-24" />
    </div>
    <div className="bg-card rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6 min-h-[180px] sm:min-h-[220px] flex justify-center items-center">
      <p className="text-sm sm:text-base">Equity Curve Chart (placeholder)</p>
    </div>
    <div className="mb-4 sm:mb-6">
      <div className="overflow-x-auto flex gap-3">
        <Skeleton className="h-16 sm:h-20 min-w-[140px] sm:min-w-[150px] rounded-lg" />
        <Skeleton className="h-16 sm:h-20 min-w-[140px] sm:min-w-[150px] rounded-lg" />
        <Skeleton className="h-16 sm:h-20 min-w-[140px] sm:min-w-[150px] rounded-lg" />
      </div>
    </div>
    <div className="bg-card rounded-lg shadow p-3 sm:p-4">
      <Skeleton className="h-6 sm:h-8 w-1/4 mb-3 sm:mb-4" />
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-5 sm:h-6 w-full" />
        <Skeleton className="h-5 sm:h-6 w-full" />
        <Skeleton className="h-5 sm:h-6 w-full" />
      </div>
    </div>
  </>
);

export default function Dashboard() {
  const { data: trades, isLoading } = useTrades();

  const stats = useMemo(() => {
    if (!trades) {
      return {
        todaysPL: 0,
        winRate: 0,
        openTradesCount: 0,
        openTrades: [],
        closedTrades: [],
      };
    }

    const closedTrades = trades.filter((t) => t.closed_at);
    const openTrades = trades.filter((t) => !t.closed_at);

    const todaysPL = closedTrades
      .filter((t) => t.closed_at && isToday(parseISO(t.closed_at)))
      .reduce((acc, trade) => acc + (trade.pnl || 0), 0);

    const winningTrades = closedTrades.filter((t) => t.pnl && t.pnl > 0);
    const winRate =
      closedTrades.length > 0
        ? (winningTrades.length / closedTrades.length) * 100
        : 0;

    return {
      todaysPL,
      winRate,
      openTradesCount: openTrades.length,
      openTrades,
      closedTrades: closedTrades
        .sort((a, b) => new Date(b.closed_at!).getTime() - new Date(a.closed_at!).getTime())
        .slice(0, 5),
    };
  }, [trades]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          title="Today's P/L"
          value={stats.todaysPL.toFixed(2)}
          valueClassName={cn(
            stats.todaysPL > 0 && "text-green-600",
            stats.todaysPL < 0 && "text-red-600"
          )}
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(0)}%`}
        />
        <StatCard
          title="Open Trades"
          value={stats.openTradesCount}
        />
        <div className="bg-card shadow rounded-lg p-3 sm:p-4 flex flex-col items-center">
          <span className="text-sm sm:text-lg font-bold">Strategy</span>
          <span className="text-xs sm:text-sm">No suggestion</span>
          <button className="mt-2 text-xs underline text-teal-600">Apply Checklist</button>
        </div>
      </div>

      {/* Equity curve chart placeholder */}
      <div className="bg-card rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6 min-h-[180px] sm:min-h-[220px] flex justify-center items-center">
        <span className="text-sm sm:text-base">Equity Curve Chart (placeholder)</span>
      </div>

      {/* Open trades strip */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-2">Open Trades</h3>
        <div className="overflow-x-auto flex gap-3 pb-2">
          {stats.openTrades.length > 0 ? (
            stats.openTrades.map((trade) => (
              <div key={trade.id} className="bg-card shadow rounded-lg p-3 min-w-[160px] sm:min-w-[180px] border-l-4"
                style={{ borderLeftColor: trade.side === 'long' ? '#22c55e' : '#ef4444' }}>
                <div className="font-bold text-sm sm:text-base">{trade.symbol}</div>
                <div className="text-xs sm:text-sm capitalize">{trade.side}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {trade.size} @ {trade.entry_price}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-muted px-3 sm:px-4 py-2 rounded-lg min-w-[120px] text-sm">No open trades</div>
          )}
        </div>
      </div>
      
      {/* Recent closed trades */}
      <div className="bg-card rounded-lg shadow p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold mb-2">Recent Closed Trades</h3>
        <div className="divide-y divide-border">
          {stats.closedTrades.length > 0 ? (
            stats.closedTrades.map((trade) => (
              <div key={trade.id} className="py-2 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-sm sm:text-base">{trade.symbol}</span>
                  <span className="ml-2 text-xs sm:text-sm text-muted-foreground capitalize">{trade.side}</span>
                </div>
                <div className="text-right">
                  <Badge variant={trade.pnl && trade.pnl > 0 ? "default" : "destructive"}
                    className={cn(
                      "text-xs sm:text-sm",
                      trade.pnl && trade.pnl > 0 && "bg-green-600/20 text-green-700 border-green-600/30",
                      trade.pnl && trade.pnl <= 0 && "bg-red-600/20 text-red-700 border-red-600/30"
                    )}>
                    {trade.pnl?.toFixed(2) || "0.00"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(trade.closed_at!), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-2 text-muted-foreground text-sm">No closed trades</div>
          )}
        </div>
      </div>
    </>
  );
}
