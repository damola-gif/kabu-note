
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionProvider";
import { StrategyWithProfile } from './types';

const STRATEGIES_PER_PAGE = 9;

export function useMyStrategies() {
  const { user } = useSession();
  
  return useInfiniteQuery({
    queryKey: ["strategies", user?.id],
    queryFn: async ({ pageParam = 0 }): Promise<StrategyWithProfile[]> => {
      if (!user) return [];
      
      const from = pageParam * STRATEGIES_PER_PAGE;
      const to = from + STRATEGIES_PER_PAGE - 1;

      // Step 1: Fetch only current user's strategies
      const { data: strategies, error: strategiesError } = await supabase
        .from("strategies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (strategiesError) throw new Error(strategiesError.message);
      if (!strategies) return [];

      // Step 2: Fetch current user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError.message);
        return strategies.map(s => ({ ...s, profile: null }));
      }

      return strategies.map(strategy => ({
        ...strategy,
        profile: profile,
      }));
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < STRATEGIES_PER_PAGE) {
        return undefined;
      }
      return lastPage.length;
    },
    enabled: !!user,
  });
}
