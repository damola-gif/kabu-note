
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

interface InteractiveChartsProps {
  trades: any[];
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

export function InteractiveCharts({ trades, timeRange, onTimeRangeChange }: InteractiveChartsProps) {
  const [selectedChart, setSelectedChart] = useState<'performance' | 'volume' | 'distribution' | 'correlation'>('performance');

  // Prepare performance data with cumulative P&L
  const performanceData = trades.reduce((acc: any[], trade) => {
    if (!trade.closed_at) return acc;
    
    const date = new Date(trade.closed_at).toLocaleDateString();
    const existingDay = acc.find(item => item.date === date);
    
    if (existingDay) {
      existingDay.pnl += trade.pnl || 0;
      existingDay.trades += 1;
      existingDay.volume += Math.abs(trade.pnl || 0);
    } else {
      acc.push({
        date,
        pnl: trade.pnl || 0,
        trades: 1,
        volume: Math.abs(trade.pnl || 0),
        cumulativePnL: 0
      });
    }
    return acc;
  }, []);

  // Calculate cumulative P&L
  let cumulative = 0;
  performanceData.forEach(item => {
    cumulative += item.pnl;
    item.cumulativePnL = cumulative;
  });

  // Volume analysis data
  const volumeData = trades.reduce((acc: any[], trade) => {
    const hour = new Date(trade.opened_at).getHours();
    const existingHour = acc.find(item => item.hour === hour);
    
    if (existingHour) {
      existingHour.trades += 1;
      existingHour.volume += trade.size || 0;
    } else {
      acc.push({
        hour,
        hourLabel: `${hour}:00`,
        trades: 1,
        volume: trade.size || 0
      });
    }
    return acc;
  }, []);

  // Symbol distribution
  const symbolData = trades.reduce((acc: any[], trade) => {
    const existing = acc.find(item => item.symbol === trade.symbol);
    if (existing) {
      existing.count += 1;
      existing.pnl += trade.pnl || 0;
    } else {
      acc.push({
        symbol: trade.symbol,
        count: 1,
        pnl: trade.pnl || 0
      });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count).slice(0, 10);

  // Win/Loss distribution
  const distributionData = [
    { name: 'Wins', value: trades.filter(t => (t.pnl || 0) > 0).length, color: '#22c55e' },
    { name: 'Losses', value: trades.filter(t => (t.pnl || 0) < 0).length, color: '#ef4444' },
    { name: 'Breakeven', value: trades.filter(t => (t.pnl || 0) === 0).length, color: '#6b7280' }
  ];

  // Risk vs Reward scatter plot
  const riskRewardData = trades.map(trade => ({
    risk: Math.abs((trade.entry_price - (trade.stop_loss || trade.entry_price)) / trade.entry_price * 100),
    reward: Math.abs((trade.pnl || 0) / (trade.size * trade.entry_price) * 100),
    pnl: trade.pnl || 0,
    symbol: trade.symbol
  })).filter(item => item.risk > 0 && item.risk < 50); // Filter out extreme values

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const charts = {
    performance: (
      <ComposedChart data={performanceData} height={400}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip content={<CustomTooltip />} />
        <Bar yAxisId="left" dataKey="pnl" fill="#8884d8" name="Daily P&L" />
        <Line yAxisId="right" type="monotone" dataKey="cumulativePnL" stroke="#ff7300" strokeWidth={3} name="Cumulative P&L" />
        <ReferenceLine yAxisId="left" y={0} stroke="#666" strokeDasharray="2 2" />
      </ComposedChart>
    ),
    volume: (
      <AreaChart data={volumeData} height={400}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hourLabel" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="trades" stackId="1" stroke="#8884d8" fill="#8884d8" name="Trade Count" />
        <Area type="monotone" dataKey="volume" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Volume" />
      </AreaChart>
    ),
    distribution: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4">Win/Loss Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Top Symbols by Trade Count</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={symbolData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="symbol" type="category" width={60} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
    correlation: (
      <div>
        <h4 className="text-lg font-semibold mb-4">Risk vs Reward Analysis</h4>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={riskRewardData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="risk" name="Risk %" />
            <YAxis dataKey="reward" name="Reward %" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{data.symbol}</p>
                      <p>Risk: {data.risk.toFixed(2)}%</p>
                      <p>Reward: {data.reward.toFixed(2)}%</p>
                      <p style={{ color: data.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                        P&L: ${data.pnl.toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter 
              dataKey="reward" 
              fill="#8884d8"
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                const color = payload.pnl >= 0 ? '#22c55e' : '#ef4444';
                return <circle cx={cx} cy={cy} r={4} fill={color} />;
              }}
            />
            <ReferenceLine x={0} stroke="#666" strokeDasharray="2 2" />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    )
  };

  const chartOptions = [
    { key: 'performance', label: 'Performance', icon: TrendingUp },
    { key: 'volume', label: 'Volume', icon: Activity },
    { key: 'distribution', label: 'Distribution', icon: Target },
    { key: 'correlation', label: 'Risk Analysis', icon: TrendingDown }
  ];

  const timeRangeOptions = [
    { key: 'week', label: '1W' },
    { key: 'month', label: '1M' },
    { key: 'quarter', label: '3M' },
    { key: 'year', label: '1Y' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Interactive Analytics</CardTitle>
            <CardDescription>Detailed analysis of your trading performance</CardDescription>
          </div>
          <div className="flex gap-2">
            {timeRangeOptions.map(option => (
              <Button
                key={option.key}
                variant={timeRange === option.key ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeRangeChange(option.key as any)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {chartOptions.map(option => {
            const Icon = option.icon;
            return (
              <Button
                key={option.key}
                variant={selectedChart === option.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart(option.key as any)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          {charts[selectedChart]}
        </ResponsiveContainer>
        
        {selectedChart === 'performance' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {trades.filter(t => (t.pnl || 0) > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Winning Trades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {trades.filter(t => (t.pnl || 0) < 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Losing Trades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {trades.length > 0 ? ((trades.filter(t => (t.pnl || 0) > 0).length / trades.length) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                ${trades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Total P&L</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
