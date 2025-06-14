
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { TradeFormValues, EditTradeFormValues } from "@/components/trade/trade.schemas";

async function fetchTrades(userId: string | undefined) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .order("opened_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export function useTrades() {
    const { user } = useSession();
    return useQuery({
        queryKey: ["trades", user?.id],
        queryFn: () => fetchTrades(user?.id),
        enabled: !!user,
    });
}

export function useCreateTrade() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTrade: TradeFormValues) => {
      if (!user) throw new Error("User must be logged in to create a trade");
      const tradeData: TablesInsert<'trades'> = {
        symbol: newTrade.symbol,
        side: newTrade.side,
        size: newTrade.size,
        entry_price: newTrade.entry_price,
        stop_loss: newTrade.stop_loss,
        take_profit: newTrade.take_profit,
        user_id: user.id,
      };
      const { error } = await supabase.from("trades").insert(tradeData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Trade created successfully");
      queryClient.invalidateQueries({ queryKey: ["trades", user?.id] });
    },
    onError: (error) => {
      toast.error(`Error creating trade: ${error.message}`);
    },
  });
}

export function useUpdateTrade() {
    const { user } = useSession();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
          values: TablesUpdate<"trades">;
          tradeId: string;
        }) => {
          const { values, tradeId } = payload;
          const updateData: TablesUpdate<"trades"> = { ...values };

          // If exit_price is being set, calculate P/L and set closed_at
          if (values.exit_price !== null && values.exit_price !== undefined) {
              // Fetch original trade to ensure correct P/L calculation based on original entry price
              const { data: originalTrade, error: fetchError } = await supabase
                .from('trades')
                .select('side, size, entry_price')
                .eq('id', tradeId)
                .single();
              
              if (fetchError) throw fetchError;
              if (!originalTrade) throw new Error("Original trade not found to calculate P/L.");

              const { side, size, entry_price } = originalTrade;
              
              let pnl;
              if (side === 'long') {
                  pnl = (values.exit_price - entry_price) * size;
              } else { // short
                  pnl = (entry_price - values.exit_price) * size;
              }
              updateData.pnl = pnl;
              updateData.closed_at = new Date().toISOString();
          } else if (values.hasOwnProperty('exit_price') && values.exit_price === null) {
            // If exit_price is explicitly cleared (e.g., from Edit form), reopen the trade
            updateData.pnl = null;
            updateData.closed_at = null;
          }

          const { error } = await supabase
            .from("trades")
            .update(updateData)
            .eq("id", tradeId);
          if (error) throw error;
        },
        onSuccess: () => {
          toast.success("Trade updated successfully!");
          queryClient.invalidateQueries({ queryKey: ["trades", user?.id] });
        },
        onError: (error) => {
          toast.error(`Error updating trade: ${error.message}`);
        },
    });
}

export function useDeleteTrade() {
    const { user } = useSession();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (tradeId: string) => {
          const { error } = await supabase.from("trades").delete().eq("id", tradeId);
          if (error) {
            throw error;
          }
        },
        onSuccess: () => {
          toast.success("Trade deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["trades", user?.id] });
        },
        onError: (error) => {
          toast.error(`Error deleting trade: ${error.message}`);
        },
    });
}
