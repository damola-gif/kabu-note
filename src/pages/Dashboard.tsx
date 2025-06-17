
import { useTrades } from "@/hooks/useTrades";
import { useStrategies } from "@/hooks/useStrategies";
import { useState } from "react";
import { useDeleteTrade } from "@/hooks/useTrades";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardDialogs } from "@/components/dashboard/DashboardDialogs";

export default function Dashboard() {
  const { data: trades, isLoading: tradesLoading } = useTrades();
  const { data: strategiesData, isLoading: strategiesLoading } = useStrategies();
  const deleteTradeMutation = useDeleteTrade();

  const [editingTrade, setEditingTrade] = useState<Tables<"trades"> | null>(null);
  const [closingTrade, setClosingTrade] = useState<Tables<"trades"> | null>(null);
  const [viewingTrade, setViewingTrade] = useState<Tables<"trades"> | null>(null);

  const strategies = strategiesData?.pages?.flat() || [];

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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="border-x border-border min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Greeting */}
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Welcome back, Trader 👋
              </h2>
              <p className="text-muted-foreground mt-1">Here's what's happening with your trades today.</p>
            </div>

            {/* Quick Stats Overview */}
            <DashboardStats trades={trades || []} strategies={strategies} />

            {/* Analytics and Performance Tabs */}
            <DashboardContent
              trades={trades || []}
              strategies={strategies}
              onEdit={handleEditTrade}
              onClose={handleCloseTrade}
              onDelete={handleDeleteTrade}
              onViewDetails={handleViewDetails}
              isDeleting={deleteTradeMutation.isPending}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <DashboardDialogs
        editingTrade={editingTrade}
        closingTrade={closingTrade}
        viewingTrade={viewingTrade}
        onEditingTradeChange={setEditingTrade}
        onClosingTradeChange={setClosingTrade}
        onViewingTradeChange={setViewingTrade}
      />
    </div>
  );
}
