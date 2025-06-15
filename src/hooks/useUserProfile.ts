
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      if (!username) return null;
      
      console.log("Fetching profile for username:", username);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.log("Profile fetch error:", error);
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw error;
      }

      console.log("Profile found:", profile);
      return profile;
    },
    enabled: !!username,
  });
}

export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ["userStats", userId],
    queryFn: async () => {
      if (!userId) return null;

      console.log("Fetching user stats for:", userId);

      // Get follower count
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (followersError) throw followersError;

      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (followingError) throw followingError;

      // Get public strategies count
      const { count: strategiesCount, error: strategiesError } = await supabase
        .from('strategies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_public', true);

      if (strategiesError) throw strategiesError;

      // Get total likes received on strategies
      const { data: strategies, error: userStrategiesError } = await supabase
        .from('strategies')
        .select('likes_count')
        .eq('user_id', userId)
        .eq('is_public', true);

      if (userStrategiesError) throw userStrategiesError;

      const totalLikes = strategies?.reduce((sum, strategy) => sum + (strategy.likes_count || 0), 0) || 0;

      // Calculate average win rate
      const { data: strategiesWithWinRate, error: winRateError } = await supabase
        .from('strategies')
        .select('win_rate')
        .eq('user_id', userId)
        .eq('is_public', true)
        .not('win_rate', 'is', null);

      if (winRateError) throw winRateError;

      const avgWinRate = strategiesWithWinRate && strategiesWithWinRate.length > 0
        ? strategiesWithWinRate.reduce((sum, s) => sum + Number(s.win_rate), 0) / strategiesWithWinRate.length
        : null;

      const result = {
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        strategiesCount: strategiesCount || 0,
        totalLikes,
        avgWinRate: avgWinRate ? Math.round(avgWinRate * 100) / 100 : null,
      };

      console.log("User stats result:", result);
      
      return result;
    },
    enabled: !!userId,
  });
}

export function useUserStrategies(userId: string) {
  return useQuery({
    queryKey: ["userStrategies", userId],
    queryFn: async () => {
      if (!userId) return [];

      console.log("Fetching user strategies for:", userId);

      const { data: strategies, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("User strategies result:", strategies);

      return strategies || [];
    },
    enabled: !!userId,
  });
}
