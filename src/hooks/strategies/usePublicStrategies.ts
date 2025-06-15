
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StrategyWithProfile } from './types';

const STRATEGIES_PER_PAGE = 9;

export function usePublicStrategies() {
  return useInfiniteQuery({
    queryKey: ["publicStrategies"],
    queryFn: async ({ pageParam = 0 }): Promise<StrategyWithProfile[]> => {
      const from = pageParam * STRATEGIES_PER_PAGE;
      const to = from + STRATEGIES_PER_PAGE - 1;

      // RLS policy "Users can view public and approved strategies" filters the results.
      const { data: strategies, error } = await supabase
        .from("strategies")
        .select("*, profile:profiles(id, username, avatar_url)")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      if (!strategies) return [];

      return strategies.map(s => ({
        ...s,
        profile: Array.isArray(s.profile) ? s.profile[0] : s.profile
      })) as StrategyWithProfile[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < STRATEGIES_PER_PAGE) {
        return undefined;
      }
      return allPages.length;
    },
  });
}
