
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionProvider";
import { useFollowing } from "@/hooks/useProfile";
import { StrategyWithProfile } from './types';

const STRATEGIES_PER_PAGE = 9;

export function useFollowingStrategies() {
  const { user } = useSession();
  const { data: followingIds } = useFollowing();

  return useInfiniteQuery({
    queryKey: ['followingStrategies', user?.id, followingIds],
    queryFn: async ({ pageParam = 0 }): Promise<StrategyWithProfile[]> => {
      if (!user || !followingIds || followingIds.length === 0) {
        return [];
      }

      const from = pageParam * STRATEGIES_PER_PAGE;
      const to = from + STRATEGIES_PER_PAGE - 1;

      // RLS policy "Followers can view pending strategies for voting" will enforce the core logic.
      const { data: strategies, error } = await supabase
        .from('strategies')
        .select('*, profile:profiles(id, username, avatar_url)')
        .in('user_id', followingIds)
        .eq('voting_status', 'pending')
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching following strategies:", error.message);
        throw error;
      }
      if (!strategies || strategies.length === 0) return [];
      
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
    enabled: !!user && !!followingIds,
  });
}
