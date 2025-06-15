
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StrategyWithProfile } from './types';

export function useSingleStrategy(id: string) {
  return useQuery({
    queryKey: ["strategy", id],
    queryFn: async (): Promise<StrategyWithProfile | null> => {
      const { data: strategy, error } = await supabase
        .from("strategies")
        .select("*, profile:profiles(id, username, avatar_url)")
        .eq("id", id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
            console.warn(`Strategy with id ${id} not found or access denied.`);
            return null;
        }
        throw new Error(error.message);
      }

      if (!strategy) return null;

      // The profile is returned as an object, not an array, so this is fine.
      return strategy as StrategyWithProfile;
    },
    enabled: !!id,
  });
}
