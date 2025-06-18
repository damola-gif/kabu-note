import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { TradeDialog } from "@/components/dashboard/TradeDialog";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { StrategyWithProfile, useStrategies } from "@/hooks/useStrategies";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [isEditTradeOpen, setIsEditTradeOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Tables<"trades"> | null>(null);

  const queryClient = useQueryClient();

  const { data: trades, isLoading } = useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: strategies } = useStrategies();

  const createTrade = useMutation({
    mutationFn: async (values: Omit<Tables<"trades">, "id">) => {
      const { data, error } = await supabase.from("trades").insert([values]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Trade created!");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      setIsNewTradeOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Could not create trade: ${error.message}`);
    },
  });

  const updateTrade = useMutation({
    mutationFn: async (values: Tables<"trades">) => {
      const { data, error } = await supabase
        .from("trades")
        .update(values)
        .eq("id", values.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Trade updated!");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      setIsEditTradeOpen(false);
      setSelectedTrade(null);
    },
    onError: (error: Error) => {
      toast.error(`Could not update trade: ${error.message}`);
    },
  });

  const closeTrade = useMutation({
    mutationFn: async (tradeId: string) => {
      const { data, error } = await supabase
        .from("trades")
        .update({ closed_at: new Date().toISOString() })
        .eq("id", tradeId);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Trade closed!");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
    onError: (error: Error) => {
      toast.error(`Could not close trade: ${error.message}`);
    },
  });

  const deleteTrade = useMutation({
    mutationFn: async (tradeId: string) => {
      const { data, error } = await supabase
        .from("trades")
        .delete()
        .eq("id", tradeId);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Trade deleted!");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      setSelectedTrade(null);
    },
    onError: (error: Error) => {
      toast.error(`Could not delete trade: ${error.message}`);
    },
  });

  const handleCreateTrade = (values: Omit<Tables<"trades">, "id">) => {
    createTrade.mutate(values);
  };

  const handleEditTrade = (trade: Tables<"trades">) => {
    setSelectedTrade(trade);
    setIsEditTradeOpen(true);
  };

  const handleUpdateTrade = (values: Tables<"trades">) => {
    updateTrade.mutate(values);
  };

  const handleCloseTrade = (trade: Tables<"trades">) => {
    closeTrade.mutate(trade.id);
  };

  const handleDeleteTrade = (tradeId: string) => {
    deleteTrade.mutate(tradeId);
  };

  const isMobile = useIsMobile();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {isMobile ? (
        <MobileDashboard
          trades={trades || []}
          strategies={strategies || []}
          onNewTrade={() => setIsNewTradeOpen(true)}
          onEdit={handleEditTrade}
          onClose={handleCloseTrade}
          onDelete={handleDeleteTrade}
          onViewDetails={setSelectedTrade}
          isDeleting={deleteTrade.isPending}
        />
      ) : (
        <DashboardContent
          trades={trades || []}
          strategies={strategies || []}
          onEdit={handleEditTrade}
          onClose={handleCloseTrade}
          onDelete={handleDeleteTrade}
          onViewDetails={setSelectedTrade}
          isDeleting={deleteTrade.isPending}
        />
      )}

      {/* New Trade Dialog */}
      <TradeDialog
        open={isNewTradeOpen}
        onOpenChange={setIsNewTradeOpen}
        onSubmit={handleCreateTrade}
      />

      {/* Edit Trade Dialog */}
      <TradeDialog
        open={isEditTradeOpen}
        onOpenChange={setIsEditTradeOpen}
        onSubmit={handleUpdateTrade}
        trade={selectedTrade}
      />
    </>
  );
}
