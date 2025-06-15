
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFollowersList(userId: string) {
  return useQuery({
    queryKey: ["followersList", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log("Fetching followers for user:", userId);
      
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          created_at,
          profiles!follows_follower_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('following_id', userId);

      if (error) {
        console.error("Error fetching followers:", error);
        throw error;
      }
      
      console.log("Followers data:", data);
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useFollowingList(userId: string) {
  return useQuery({
    queryKey: ["followingList", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log("Fetching following for user:", userId);
      
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          created_at,
          profiles!follows_following_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', userId);

      if (error) {
        console.error("Error fetching following:", error);
        throw error;
      }
      
      console.log("Following data:", data);
      return data || [];
    },
    enabled: !!userId,
  });
}
