
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function getProfilesByIds(userIds: string[]): Promise<any[]> {
  if (!userIds.length) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds);

  if (error) {
    console.error("getProfilesByIds: Error fetching profiles", error);
    throw error;
  }
  return data || [];
}

export function useFollowersList(userId: string) {
  return useQuery({
    queryKey: ["followersList", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("useFollowersList: No userId provided");
        return [];
      }

      // 1. Get rows from follows where following_id = userId
      const { data: follows, error } = await supabase
        .from("follows")
        .select("follower_id, created_at")
        .eq("following_id", userId);

      if (error) {
        console.error("useFollowersList: Error fetching follows:", error);
        throw error;
      }
      if (!follows || follows.length === 0) return [];

      // 2. Find all unique follower_ids
      const followerIds = Array.from(
        new Set(follows.map(f => f.follower_id).filter(Boolean))
      );
      // 3. Fetch their profiles
      const profiles = await getProfilesByIds(followerIds);

      // 4. Join results
      const byId: Record<string, any> = {};
      profiles.forEach(p => { if (p?.id) byId[p.id] = p; });
      const result = follows
        .map(f => ({
          ...f,
          profiles: byId[f.follower_id] || null,
        }))
        .filter(f => f.profiles);

      return result;
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

      // 1. Get rows from follows where follower_id = userId
      const { data: follows, error } = await supabase
        .from("follows")
        .select("following_id, created_at")
        .eq("follower_id", userId);

      if (error) {
        console.error("useFollowingList: Error fetching follows:", error);
        throw error;
      }
      if (!follows || follows.length === 0) return [];

      // 2. Find all unique following_ids
      const followingIds = Array.from(
        new Set(follows.map(f => f.following_id).filter(Boolean))
      );
      // 3. Fetch their profiles
      const profiles = await getProfilesByIds(followingIds);

      // 4. Join results
      const byId: Record<string, any> = {};
      profiles.forEach(p => { if (p?.id) byId[p.id] = p; });
      const result = follows
        .map(f => ({
          ...f,
          profiles: byId[f.following_id] || null,
        }))
        .filter(f => f.profiles);

      return result;
    },
    enabled: !!userId,
  });
}
