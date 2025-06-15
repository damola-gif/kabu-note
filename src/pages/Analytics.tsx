
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/dashboard/StatCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { useStrategies } from '@/hooks/useStrategies';
import { useTrades } from '@/hooks/useTrades';
import { useSession } from '@/contexts/SessionProvider';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Users } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function Analytics() {
  const { user } = useSession();
  const { data: strategiesData, isLoading: strategiesLoading } = useStrategies();
  const { data: trades, isLoading: tradesLoading } = useTrades();

  if (strategiesLoading || tradesLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Safely handle strategies data - it could be InfiniteData or array
  const strategies = strategiesData?.pages ? 
    strategiesData.pages.flatMap(page => page) : 
    (Array.isArray(strategiesData) ? strategiesData : []);

  // Filter user's strategies
  const userStrategies = strategies.filter(strategy => strategy.user_id === user?.id);
  const publishedStrategies = userStrategies.filter(s => s.is_public);

  // Calculate performance metrics
  const totalTrades = trades?.length || 0;
  const winningTrades = trades?.filter(trade => 
    trade.exit_price && trade.entry_price && 
    ((trade.position_type === 'long' && trade.exit_price > trade.entry_price) ||
     (trade.position_type === 'short' && trade.exit_price < trade.entry_price))
  ).length || 0;
  
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : '0';
  
  const totalPnL = trades?.reduce((acc, trade) => {
    if (!trade.exit_price || !trade.entry_price) return acc;
    const pnl = trade.position_type === 'long' 
      ? (trade.exit_price - trade.entry_price) * trade.quantity
      : (trade.entry_price - trade.exit_price) * trade.quantity;
    return acc + pnl;
  }, 0) || 0;

  const avgPnL = totalTrades > 0 ? (totalPnL / totalTrades).toFixed(2) : '0';

  // Calculate total likes across all strategies
  const totalLikes = userStrategies.reduce((acc, strategy) => acc + (strategy.likes_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your trading performance and strategy metrics</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Strategies"
          value={userStrategies.length.toString()}
          icon={Target}
        />
        <StatCard
          title="Published Strategies"
          value={publishedStrategies.length.toString()}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Likes"
          value={totalLikes.toString()}
          icon={Users}
        />
        <StatCard
          title="Win Rate"
          value={`${winRate}%`}
          icon={BarChart3}
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Trades</span>
                    <span className="text-lg font-bold">{totalTrades}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Winning Trades</span>
                    <span className="text-lg font-bold text-green-600">{winningTrades}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Losing Trades</span>
                    <span className="text-lg font-bold text-red-600">{totalTrades - winningTrades}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Win Rate</span>
                    <span className="text-lg font-bold">{winRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg P&L per Trade</span>
                    <span className={`text-lg font-bold ${parseFloat(avgPnL) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${avgPnL}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategy Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Strategies</span>
                    <span className="text-lg font-bold">{userStrategies.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Published</span>
                    <span className="text-lg font-bold text-green-600">{publishedStrategies.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Draft</span>
                    <span className="text-lg font-bold text-yellow-600">{userStrategies.length - publishedStrategies.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Likes</span>
                    <span className="text-lg font-bold">{totalLikes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {totalTrades > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {userStrategies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No strategies created yet</p>
                  <p className="text-sm">Create your first strategy to see analytics here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userStrategies.slice(0, 5).map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{strategy.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(strategy.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium">{strategy.likes_count || 0}</div>
                            <div className="text-xs text-muted-foreground">Likes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{strategy.comments_count || 0}</div>
                            <div className="text-xs text-muted-foreground">Comments</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-sm font-medium ${strategy.is_public ? 'text-green-600' : 'text-yellow-600'}`}>
                              {strategy.is_public ? 'Published' : 'Draft'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              {!trades || trades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No trades recorded yet</p>
                  <p className="text-sm">Start trading to see your performance analytics</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trades.slice(0, 10).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{trade.symbol}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trade.entry_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium">{trade.position_type}</div>
                            <div className="text-xs text-muted-foreground">Position</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{trade.quantity}</div>
                            <div className="text-xs text-muted-foreground">Quantity</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">${trade.entry_price}</div>
                            <div className="text-xs text-muted-foreground">Entry</div>
                          </div>
                          {trade.exit_price && (
                            <div className="text-center">
                              <div className="text-sm font-medium">${trade.exit_price}</div>
                              <div className="text-xs text-muted-foreground">Exit</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
