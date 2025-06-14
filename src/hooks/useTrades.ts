
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";

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
