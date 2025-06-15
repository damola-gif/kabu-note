
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useTrades } from '@/hooks/useTrades';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { CalendarIcon, TrendingUp, TrendingDown, DollarSign, Target, Activity } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface PerformanceChartProps {
  trades: any[];
}

export default function Analytics() {
  const [date, setDate] = useState<Date>(new Date());
  const { data: allTrades = [], isLoading } = useTrades();

  // Filter trades for the selected month
  const filteredTrades = allTrades.filter(trade => {
    if (!trade.closed_at) return false;
    const tradeDate = parseISO(trade.closed_at);
    return tradeDate >= startOfMonth(date) && tradeDate <= endOfMonth(date);
  });

  // Calculate analytics
  const totalTrades = filteredTrades.length;
  const winningTrades = filteredTrades.filter(trade => (trade.pnl || 0) > 0);
  const losingTrades = filteredTrades.filter(trade => (trade.pnl || 0) < 0);
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  
  const totalPnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losingTrades.length) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  // Prepare chart data
  const dailyPnL = filteredTrades.reduce((acc: any[], trade) => {
    if (!trade.closed_at) return acc;
    const date = format(parseISO(trade.closed_at), 'MMM dd');
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.pnl += trade.pnl || 0;
    } else {
      acc.push({ date, pnl: trade.pnl || 0 });
    }
    return acc;
  }, []);

  // Calculate cumulative PnL
  let cumulativePnL = 0;
  const cumulativeData = dailyPnL.map(item => {
    cumulativePnL += item.pnl;
    return { ...item, cumulative: cumulativePnL };
  });

  // Symbol performance
  const symbolPerformance = filteredTrades.reduce((acc: any[], trade) => {
    const existing = acc.find(item => item.symbol === trade.symbol);
    if (existing) {
      existing.pnl += trade.pnl || 0;
      existing.trades += 1;
    } else {
      acc.push({ symbol: trade.symbol, pnl: trade.pnl || 0, trades: 1 });
    }
    return acc;
  }, []);

  // Side distribution
  const sideData = [
    { name: 'Long', value: filteredTrades.filter(t => t.side === 'long').length, color: '#22c55e' },
    { name: 'Short', value: filteredTrades.filter(t => t.side === 'short').length, color: '#ef4444' }
  ];

  const PerformanceChart = ({ trades }: PerformanceChartProps) => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={cumulativeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: any) => [`$${value.toFixed(2)}`, 'Cumulative P&L']} />
        <Line type="monotone" dataKey="cumulative" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Trading Analytics</h1>
          <p className="text-muted-foreground">
            Performance insights for {format(date, 'MMMM yyyy')}
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, 'MMMM yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalPnL.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {winningTrades.length} wins / {totalTrades} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitFactor.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Avg Win: ${avgWin.toFixed(2)} / Avg Loss: ${avgLoss.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              {winningTrades.length} wins, {losingTrades.length} losses
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="symbols">By Symbol</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cumulative P&L</CardTitle>
              <CardDescription>Your trading performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart trades={filteredTrades} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyPnL}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`$${value.toFixed(2)}`, 'Daily P&L']} />
                  <Bar dataKey="pnl" fill={(entry: any) => entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symbols" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Symbol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {symbolPerformance.map((symbol) => (
                  <div key={symbol.symbol} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{symbol.symbol}</span>
                      <span className="text-sm text-muted-foreground ml-2">({symbol.trades} trades)</span>
                    </div>
                    <Badge variant={symbol.pnl >= 0 ? 'default' : 'destructive'}>
                      ${symbol.pnl.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Long vs Short</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sideData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {sideData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTrades.slice(0, 10).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-4">
                      <Badge variant={trade.side === 'long' ? 'default' : 'secondary'}>
                        {trade.side.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{trade.symbol}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(parseISO(trade.opened_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(trade.pnl || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Size: {trade.size}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
