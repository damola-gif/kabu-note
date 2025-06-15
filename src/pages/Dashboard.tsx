
import { useTrades } from "@/hooks/useTrades";
import { useStrategies } from "@/hooks/useStrategies";
import { useMemo, useState } from "react";
import { isToday, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { OpenTrades } from "@/components/dashboard/OpenTrades";
import { DraftStrategies } from "@/components/dashboard/DraftStrategies";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CheckCircle, TrendingUp, DollarSign, BookOpen } from "lucide-react";
import { EditTradeDialog } from "@/components/trade/EditTradeDialog";
import { CloseTradeDialog } from "@/components/trade/CloseTradeDialog";
import { TradeDetailsSheet } from "@/components/trade/TradeDetailsSheet";
import { useDeleteTrade } from "@/hooks/useTrades";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <Skeleton className="h-80" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  </div>
);

export default function Dashboard() {
  const { data: trades, isLoading: tradesLoading } = useTrades();
  const { data: strategiesData, isLoading: strategiesLoading } = useStrategies();
  const deleteTradeMutation = useDeleteTrade();

  const [editingTrade, setEditingTrade] = useState<Tables<"trades"> | null>(null);
  const [closingTrade, setClosingTrade] = useState<Tables<"trades"> | null>(null);
  const [viewingTrade, setViewingTrade] = useState<Tables<"trades"> | null>(null);

  const strategies = strategiesData?.pages?.flat() || [];

  const stats = useMemo(() => {
    if (!trades) {
      return {
        totalTrades: 0,
        todaysPL: 0,
        winRate: 0,
        strategiesPublished: 0,
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

    const publishedStrategies = strategies.filter(s => s.is_public).length;

    return {
      totalTrades: trades.length,
      todaysPL,
      winRate,
      strategiesPublished: publishedStrategies,
      openTradesCount: openTrades.length,
      openTrades,
      closedTrades: closedTrades
        .sort((a, b) => new Date(b.closed_at!).getTime() - new Date(a.closed_at!).getTime())
        .slice(0, 5),
    };
  }, [trades, strategies]);

  const handleEditTrade = (trade: Tables<"trades">) => {
    setEditingTrade(trade);
  };

  const handleCloseTrade = (trade: Tables<"trades">) => {
    setClosingTrade(trade);
  };

  const handleViewDetails = (trade: Tables<"trades">) => {
    setViewingTrade(trade);
  };

  const handleDeleteTrade = (tradeId: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      deleteTradeMutation.mutate(tradeId, {
        onSuccess: () => {
          toast.success("Trade deleted successfully");
        },
      });
    }
  };

  if (tradesLoading || strategiesLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-light text-foreground">
            Welcome back, Trader 👋
          </h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your trades today.</p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={CheckCircle}
          />
          <StatCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(0)}%`}
            icon={TrendingUp}
            valueClassName={stats.winRate >= 50 ? "text-green-600" : "text-red-600"}
            trend={{
              value: stats.winRate >= 50 ? 12 : -8,
              isPositive: stats.winRate >= 50
            }}
          />
          <StatCard
            title="Today's P&L"
            value={`$${stats.todaysPL.toFixed(2)}`}
            icon={DollarSign}
            valueClassName={cn(
              stats.todaysPL > 0 && "text-green-600",
              stats.todaysPL < 0 && "text-red-600"
            )}
            trend={{
              value: Math.abs(stats.todaysPL * 0.1),
              isPositive: stats.todaysPL >= 0
            }}
          />
          <StatCard
            title="Strategies Published"
            value={stats.strategiesPublished}
            icon={BookOpen}
          />
        </div>

        {/* Performance Chart */}
        <PerformanceChart trades={trades || []} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <OpenTrades 
              trades={stats.openTrades}
              onEdit={handleEditTrade}
              onClose={handleCloseTrade}
              onDelete={handleDeleteTrade}
              onViewDetails={handleViewDetails}
              isDeleting={deleteTradeMutation.isPending}
            />
            <DraftStrategies strategies={strategies} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            <RecentActivity strategies={strategies} />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {editingTrade && (
        <EditTradeDialog
          trade={editingTrade}
          open={!!editingTrade}
          onOpenChange={(open) => !open && setEditingTrade(null)}
        />
      )}

      {closingTrade && (
        <CloseTradeDialog
          trade={closingTrade}
          open={!!closingTrade}
          onOpenChange={(open) => !open && setClosingTrade(null)}
        />
      )}

      {viewingTrade && (
        <TradeDetailsSheet
          trade={viewingTrade}
          open={!!viewingTrade}
          onOpenChange={(open) => !open && setViewingTrade(null)}
        />
      )}
    </>
  );
}
