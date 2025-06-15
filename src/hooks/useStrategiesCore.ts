import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionProvider";
import { Tables } from "@/integrations/supabase/types";
import { useFollowing } from "@/hooks/useProfile";

export type StrategyWithProfile = Tables<'strategies'> & {
  profile?: Pick<Tables<'profiles'>, 'id' | 'username' | 'avatar_url'> | null;
};

const STRATEGIES_PER_PAGE = 9;

// Hook to search strategies by hashtag
export function useHashtagSearch(hashtag: string) {
  return useQuery({
    queryKey: ['hashtagSearch', hashtag],
    queryFn: async (): Promise<StrategyWithProfile[]> => {
      if (!hashtag) return [];

      // Use the regular strategies table with proper filtering instead of the RPC function
      const { data: strategies, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('is_public', true)
        .contains('tags', [hashtag])
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!strategies) return [];

      // Get unique user IDs from the fetched strategies
      const userIds = [...new Set(strategies.map(s => s.user_id).filter(Boolean))];
      
      if (userIds.length === 0) {
        return strategies.map(s => ({ ...s, profile: null }));
      }

      // Fetch profiles for those user IDs
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError.message);
        return strategies.map(s => ({ ...s, profile: null }));
      }

      // Map profiles to strategies
      const profilesById = new Map(profiles.map(p => [p.id, p]));

      return strategies.map(strategy => ({
        ...strategy,
        profile: strategy.user_id ? profilesById.get(strategy.user_id) ?? null : null,
      }));
    },
    enabled: !!hashtag,
  });
}

// Hook to fetch strategies with pagination - ONLY current user's strategies
export function useStrategies() {
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
        // Return strategies without profile info if profile fetch fails
        return strategies.map(s => ({ ...s, profile: null }));
      }

      // Step 3: Map profile to all strategies
      return strategies.map(strategy => ({
        ...strategy,
        profile: profile,
      }));
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < STRATEGIES_PER_PAGE) {
        return undefined; // No more pages
      }
      return allPages.length;
    },
    enabled: !!user,
  });
}

// Hook to fetch a single strategy by its ID
export function useStrategy(id: string) {
  return useQuery({
    queryKey: ["strategy", id],
    queryFn: async (): Promise<StrategyWithProfile | null> => {
      const { data: strategy, error } = await supabase
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

      if (!strategy) return null;

      // Fetch the profile for the strategy owner
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", strategy.user_id)
        .single();

      if (profileError) {
        console.error("Error fetching strategy owner profile:", profileError.message);
        return { ...strategy, profile: null };
      }

      return { ...strategy, profile: profile };
    },
    enabled: !!id,
  });
}

// Hook to fetch all public strategies, paginated (for feed)
export function usePublicStrategies() {
  const { user } = useSession();
  const { data: followingIds } = useFollowing();

  return useInfiniteQuery({
    queryKey: ["publicStrategies", user?.id],
    queryFn: async ({ pageParam = 0 }): Promise<StrategyWithProfile[]> => {
      const from = pageParam * STRATEGIES_PER_PAGE;
      const to = from + STRATEGIES_PER_PAGE - 1;

      let strategies: any[] = [];

      // Only show strategies if user is owner or is a follower of the strategy's owner
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      if (!data) return [];

      // Restrict: non-followers only see public strategies if they're the owner or following
      let result: any[];
      if (!user) {
        // Not logged in, don't show strategies
        result = [];
      } else {
        // Only show if user is strategy owner or is following owner
        const userId = user.id;
        let usersFollowing = followingIds || [];
        result = data.filter((s: any) =>
          s.user_id === userId ||
          usersFollowing.includes(s.user_id)
        );
      }

      // Get unique user IDs from result
      const userIds = [...new Set(result.map(s => s.user_id).filter(Boolean))];
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);
        if (!profilesError && data) profiles = data;
      }
      const profilesById = new Map(profiles.map(p => [p.id, p]));
      return result.map(strategy => ({
        ...strategy,
        profile: strategy.user_id ? profilesById.get(strategy.user_id) ?? null : null,
      }));
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < STRATEGIES_PER_PAGE) {
        return undefined;
      }
      return allPages.length;
    },
    enabled: true,
  });
}
