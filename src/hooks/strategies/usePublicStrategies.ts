
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

      // Only show approved public strategies in the feed
      const { data: strategies, error } = await supabase
        .from("strategies")
        .select("*, profile:profiles(id, username, avatar_url)")
        .eq("is_public", true)
        .eq("voting_status", "approved")
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
