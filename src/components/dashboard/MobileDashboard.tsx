
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { StrategyWithProfile } from "@/hooks/useStrategies";
import { MobileStatsCard } from "@/components/ui/mobile-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Plus, TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionProvider";

interface MobileDashboardProps {
  trades: Tables<"trades">[];
  strategies: StrategyWithProfile[];
  onNewTrade: () => void;
  onEdit: (trade: Tables<"trades">) => void;
  onClose: (trade: Tables<"trades">) => void;
  onDelete: (tradeId: string) => void;
  onViewDetails: (trade: Tables<"trades">) => void;
  isDeleting: boolean;
}

export function MobileDashboard({
  trades,
  strategies,
  onNewTrade,
  onEdit,
  onClose,
  onDelete,
  onViewDetails,
  isDeleting
}: MobileDashboardProps) {
  const { user } = useSession();
  const openTrades = trades?.filter((t) => !t.closed_at) || [];
  const closedTrades = trades?.filter((t) => t.closed_at) || [];
  
  // Calculate stats using the correct 'pnl' field
  const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const winRate = closedTrades.length > 0 
    ? Math.round((closedTrades.filter(t => (t.pnl || 0) > 0).length / closedTrades.length) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-6">
      {/* Greeting Row */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[#1E2A4E]">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trader'} 👋
        </h1>
        <div className="w-12 h-0.5 bg-[#2AB7CA] mt-2"></div>
      </div>

      {/* Stats Carousel */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
          <MobileStatsCard
            title="Total P&L"
            value={`$${totalPnL.toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend={totalPnL >= 0 ? "up" : "down"}
            trendValue={`${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}`}
          />
          <MobileStatsCard
            title="Win Rate"
            value={`${winRate}%`}
            icon={<Target className="h-5 w-5" />}
            trend="neutral"
          />
          <MobileStatsCard
            title="Open Trades"
            value={openTrades.length}
            icon={<TrendingUp className="h-5 w-5" />}
            trend="neutral"
          />
          <MobileStatsCard
            title="Total Trades"
            value={trades.length}
            icon={<BarChart3 className="h-5 w-5" />}
            trend="neutral"
          />
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1E2A4E] mb-4">Performance</h2>
        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Chart coming soon</p>
          </div>
        </div>
      </div>

      {/* Open Trades Strip */}
      {openTrades.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1E2A4E] px-1">Open Trades</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
              {openTrades.slice(0, 5).map((trade) => {
                // For open trades, calculate unrealized P&L based on entry price
                // This is a simplified calculation - in a real app you'd use current market price
                const unrealizedPnL = trade.pnl || 0;
                
                return (
                  <div
                    key={trade.id}
                    className="bg-white rounded-lg p-3 shadow-sm border min-w-[140px] cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onViewDetails(trade)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[#1E2A4E] text-sm">
                        {trade.symbol}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose(trade);
                        }}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        Close
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        {trade.side === 'long' ? 'LONG' : 'SHORT'}
                      </p>
                      <p className={`text-sm font-semibold ${
                        unrealizedPnL >= 0 ? 'text-[#2AB7CA]' : 'text-red-500'
                      }`}>
                        {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Draft Strategies Preview - using is_draft instead of status */}
      {strategies.some(s => s.is_draft) && (
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#2AB7CA]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-[#1E2A4E]">Draft Strategy</h3>
              <p className="text-sm text-gray-600 mt-1">
                {strategies.find(s => s.is_draft)?.name || 'Untitled Strategy'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-[#2AB7CA] text-[#2AB7CA] hover:bg-[#2AB7CA] hover:text-white"
            >
              Continue Editing
            </Button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={Plus}
        onClick={onNewTrade}
      />
    </div>
  );
}
