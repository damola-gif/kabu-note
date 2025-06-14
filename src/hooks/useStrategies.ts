import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { StrategyFormValues } from "@/components/strategy/strategy.schemas";

// Hook to fetch all strategies for the logged-in user
export function useStrategies() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["strategies", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });
}

// Hook to fetch a single strategy by its ID
export function useStrategy(id: string) {
  return useQuery({
    queryKey: ["strategy", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        // PostgREST errors are thrown for RLS failures, we can't distinguish them from "not found" easily
        // So we return null and let the component handle it.
        if (error.code === 'PGRST116') {
            return null;
        }
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
  });
}

// Hook to create a new strategy
export function useCreateStrategy() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newStrategy: StrategyFormValues) => {
      if (!user) throw new Error("User must be logged in to create a strategy");
      const dataToInsert: TablesInsert<'strategies'> = {
        name: newStrategy.name,
        content_markdown: newStrategy.content_markdown,
        is_public: newStrategy.is_public,
        user_id: user.id,
      };
      const { error } = await supabase.from("strategies").insert(dataToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Strategy created successfully");
      queryClient.invalidateQueries({ queryKey: ["strategies", user?.id] });
    },
    onError: (error) => {
      toast.error(`Error creating strategy: ${error.message}`);
    },
  });
}

// Hook to update an existing strategy
export function useUpdateStrategy() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: TablesUpdate<'strategies'> & { id: string }) => {
      const { error } = await supabase
        .from("strategies")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success("Strategy updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["strategies", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["strategy", variables.id] });
    },
    onError: (error) => {
      toast.error(`Error updating strategy: ${error.message}`);
    },
  });
}

// Hook to delete a strategy
export function useDeleteStrategy() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("strategies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Strategy deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["strategies", user?.id] });
    },
    onError: (error) => {
      toast.error(`Error deleting strategy: ${error.message}`);
    },
  });
}
