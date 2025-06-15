
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { format, parseISO, startOfMonth } from "date-fns";

const chartTypes = [
  { id: "winloss", label: "Win vs Loss" },
  { id: "equity", label: "Equity Curve" },
  { id: "pnl", label: "P&L by Month" },
  { id: "asset", label: "By Asset" },
];

interface PerformanceChartProps {
  trades: Tables<"trades">[];
}

export function PerformanceChart({ trades }: PerformanceChartProps) {
  const [activeChart, setActiveChart] = useState("winloss");

  const chartData = useMemo(() => {
    const closedTrades = trades.filter(t => t.closed_at && t.pnl !== null);

    switch (activeChart) {
      case "winloss": {
        const wins = closedTrades.filter(t => t.pnl! > 0).length;
        const losses = closedTrades.filter(t => t.pnl! <= 0).length;
        return [
          { name: "Wins", value: wins, color: "#22c55e" },
          { name: "Losses", value: losses, color: "#ef4444" }
        ];
      }

      case "equity": {
        let runningBalance = 10000; // Starting balance
        return closedTrades
          .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime())
          .map(trade => {
            runningBalance += trade.pnl!;
            return {
              date: format(new Date(trade.closed_at!), "MMM dd"),
              balance: runningBalance,
              pnl: trade.pnl
            };
          });
      }

      case "pnl": {
        const monthlyPnl = closedTrades.reduce((acc, trade) => {
          const month = format(startOfMonth(new Date(trade.closed_at!)), "MMM yyyy");
          acc[month] = (acc[month] || 0) + trade.pnl!;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(monthlyPnl).map(([month, pnl]) => ({
          month,
          pnl,
          color: pnl >= 0 ? "#22c55e" : "#ef4444"
        }));
      }

      case "asset": {
        const assetPnl = closedTrades.reduce((acc, trade) => {
          acc[trade.symbol] = (acc[trade.symbol] || 0) + trade.pnl!;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(assetPnl)
          .map(([asset, pnl]) => ({ asset, pnl }))
          .sort((a, b) => b.pnl - a.pnl);
      }

      default:
        return [];
    }
  }, [trades, activeChart]);

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <p className="text-gray-500 text-sm">No data available</p>
            <p className="text-xs text-gray-400 mt-1">Complete some trades to see your performance</p>
          </div>
        </div>
      );
    }

    switch (activeChart) {
      case "winloss":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.map((entry: any, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case "equity":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [`$${value?.toFixed(2)}`, "Balance"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#2AB7CA" 
                strokeWidth={2}
                dot={{ fill: "#2AB7CA" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pnl":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [`$${value?.toFixed(2)}`, "P&L"]}
              />
              <Bar dataKey="pnl" fill="#2AB7CA" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "asset":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="asset" type="category" width={60} />
              <Tooltip 
                formatter={(value: any) => [`$${value?.toFixed(2)}`, "P&L"]}
              />
              <Bar dataKey="pnl" fill="#2AB7CA" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1E2A4E] mb-4 sm:mb-0">
          Performance Summary
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {chartTypes.map((chart) => (
            <Button
              key={chart.id}
              variant={activeChart === chart.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart(chart.id)}
              className={cn(
                "text-xs",
                activeChart === chart.id && "bg-[#2AB7CA] hover:bg-[#2AB7CA]/90"
              )}
            >
              {chart.label}
            </Button>
          ))}
        </div>
      </div>
      
      {renderChart()}
    </div>
  );
}
