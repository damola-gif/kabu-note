
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTrades } from "@/hooks/useTrades";
import { useStrategies } from "@/hooks/useStrategies";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, BarChart3 } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("30d");
  const { data: trades = [] } = useTrades();
  const { data: strategies = [] } = useStrategies();

  // Filter trades by timeframe
  const getFilteredTrades = () => {
    const now = new Date();
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : timeframe === "90d" ? 90 : 365;
    const cutoffDate = subDays(now, days);
    
    return trades.filter(trade => 
      trade.closed_at && isAfter(new Date(trade.closed_at), cutoffDate)
    );
  };

  const filteredTrades = getFilteredTrades();
  const closedTrades = filteredTrades.filter(t => t.closed_at && t.pnl !== null);

  // Calculate analytics
  const totalTrades = closedTrades.length;
  const winningTrades = closedTrades.filter(t => t.pnl! > 0).length;
  const losingTrades = closedTrades.filter(t => t.pnl! <= 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const avgWin = winningTrades > 0 
    ? closedTrades.filter(t => t.pnl! > 0).reduce((sum, t) => sum + t.pnl!, 0) / winningTrades 
    : 0;
  const avgLoss = losingTrades > 0 
    ? Math.abs(closedTrades.filter(t => t.pnl! <= 0).reduce((sum, t) => sum + t.pnl!, 0) / losingTrades)
    : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  const publicStrategies = strategies.filter(s => s.is_public && s.voting_status === 'approved').length;
  const totalStrategies = strategies.length;

  return (
    <AppShell>
      <div className="flex flex-col h-full w-full p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your trading performance and strategy insights</p>
          </div>
          
          <div className="flex gap-2">
            {["7d", "30d", "90d", "1y"].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="trading" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trading">Trading Performance</TabsTrigger>
            <TabsTrigger value="strategies">Strategy Analytics</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total P&L"
                value={`$${totalPnL.toFixed(2)}`}
                change={totalPnL >= 0 ? "positive" : "negative"}
                icon={DollarSign}
              />
              <StatCard
                title="Win Rate"
                value={`${winRate.toFixed(1)}%`}
                change={winRate >= 50 ? "positive" : "negative"}
                icon={Target}
              />
              <StatCard
                title="Total Trades"
                value={totalTrades.toString()}
                icon={BarChart3}
              />
              <StatCard
                title="Profit Factor"
                value={profitFactor.toFixed(2)}
                change={profitFactor >= 1 ? "positive" : "negative"}
                icon={TrendingUp}
              />
            </div>

            {/* Performance Chart */}
            <PerformanceChart trades={filteredTrades} />

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trade Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Winning Trades:</span>
                    <span className="font-medium text-green-600">{winningTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Losing Trades:</span>
                    <span className="font-medium text-red-600">{losingTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Win:</span>
                    <span className="font-medium text-green-600">$${avgWin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Loss:</span>
                    <span className="font-medium text-red-600">$${avgLoss.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit Factor:</span>
                    <span className="font-medium">{profitFactor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk/Reward:</span>
                    <span className="font-medium">{avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Trade:</span>
                    <span className="font-medium text-green-600">
                      $${Math.max(...closedTrades.map(t => t.pnl || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Worst Trade:</span>
                    <span className="font-medium text-red-600">
                      $${Math.min(...closedTrades.map(t => t.pnl || 0)).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Strategies"
                value={totalStrategies.toString()}
                icon={BarChart3}
              />
              <StatCard
                title="Public Strategies"
                value={publicStrategies.toString()}
                icon={TrendingUp}
              />
              <StatCard
                title="Draft Strategies"
                value={(totalStrategies - publicStrategies).toString()}
                icon={Calendar}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance</CardTitle>
                <CardDescription>
                  Performance metrics for your published strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {strategies.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No strategies created yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start creating strategies to see performance data
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {strategies.slice(0, 5).map((strategy) => (
                      <div key={strategy.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{strategy.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {strategy.is_public ? 'Public' : 'Draft'} • {strategy.likes_count} likes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{strategy.win_rate ? `${strategy.win_rate}%` : 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">Win Rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>
                  Summary of your trading portfolio and open positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Portfolio tracking coming soon</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We're working on advanced portfolio analytics
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
