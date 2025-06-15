
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFollowersList(userId: string) {
  return useQuery({
    queryKey: ["followersList", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("useFollowersList: No userId provided");
        return [];
      }
      
      console.log("useFollowersList: Fetching followers for user:", userId);
      
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          created_at,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('following_id', userId);

      if (error) {
        console.error("useFollowersList: Error fetching followers:", error);
        throw error;
      }
      
      console.log("useFollowersList: Raw data from database:", data);
      console.log("useFollowersList: Data length:", data?.length || 0);
      
      // Filter out any results where the profile might be missing
      const filteredData = data?.filter(item => item.profiles) || [];
      console.log("useFollowersList: Filtered data:", filteredData);
      
      return filteredData;
    },
    enabled: !!userId,
  });
}

export function useFollowingList(userId: string) {
  return useQuery({
    queryKey: ["followingList", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("useFollowingList: No userId provided");
        return [];
      }
      
      console.log("useFollowingList: Fetching following for user:", userId);
      
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          created_at,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', userId);

      if (error) {
        console.error("useFollowingList: Error fetching following:", error);
        throw error;
      }
      
      console.log("useFollowingList: Raw data from database:", data);
      console.log("useFollowingList: Data length:", data?.length || 0);
      
      // Filter out any results where the profile might be missing
      const filteredData = data?.filter(item => item.profiles) || [];
      console.log("useFollowingList: Filtered data:", filteredData);
      
      return filteredData;
    },
    enabled: !!userId,
  });
}
