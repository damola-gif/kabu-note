
import { useMemo } from "react";
import { isToday, parseISO } from "date-fns";
import { StatCard } from "@/components/dashboard/StatCard";
import { CheckCircle, TrendingUp, DollarSign, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { StrategyWithProfile } from "@/hooks/useStrategies";

interface DashboardStatsProps {
  trades: Tables<"trades">[];
  strategies: StrategyWithProfile[];
}

export function DashboardStats({ trades, strategies }: DashboardStatsProps) {
  const stats = useMemo(() => {
    if (!trades) {
      return {
        totalTrades: 0,
        todaysPL: 0,
        winRate: 0,
        strategiesPublished: 0,
      };
    }

    const closedTrades = trades.filter((t) => t.closed_at);

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
    };
  }, [trades, strategies]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
  );
}
