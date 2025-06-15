
import { useTrades } from "@/hooks/useTrades";
import { useMemo } from "react";
import { isToday, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { OpenTrades } from "@/components/dashboard/OpenTrades";
import { DraftStrategies } from "@/components/dashboard/DraftStrategies";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CheckCircle, TrendingUp, DollarSign, BookOpen } from "lucide-react";

const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Greeting Skeleton */}
    <Skeleton className="h-8 w-64" />
    
    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    
    {/* Chart Skeleton */}
    <Skeleton className="h-80" />
    
    {/* Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  </div>
);

export default function Dashboard() {
  const { data: trades, isLoading } = useTrades();

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

    return {
      totalTrades: trades.length,
      todaysPL,
      winRate,
      strategiesPublished: 6, // Mock data - replace with real count
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
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E2A4E]">
          Welcome back, Trader 👋
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your trades today.</p>
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
        />
        <StatCard
          title="Net Profit/Loss"
          value={`$${stats.todaysPL.toFixed(2)}`}
          icon={DollarSign}
          valueClassName={cn(
            stats.todaysPL > 0 && "text-green-600",
            stats.todaysPL < 0 && "text-red-600"
          )}
        />
        <StatCard
          title="Strategies Published"
          value={stats.strategiesPublished}
          icon={BookOpen}
        />
      </div>

      {/* Performance Chart */}
      <PerformanceChart />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <OpenTrades />
          <DraftStrategies />
        </div>
        
        {/* Right Column */}
        <div className="space-y-8">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
