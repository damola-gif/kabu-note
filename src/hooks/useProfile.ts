
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionProvider";
import { toast } from "sonner";

export function useProfile() {
  const { user } = useSession();
  
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Profile not found
        }
        throw error;
      }

      return profile;
    },
    enabled: !!user,
  });
}

export function useFollowing() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["following", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      if (error) throw new Error(error.message);
      return data.map((f) => f.following_id);
    },
    enabled: !!user,
  });
}

// Hook to follow a user
export function useFollowUser() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIdToFollow: string) => {
      if (!user) throw new Error("You must be logged in to follow users.");
      if (user.id === userIdToFollow) throw new Error("You cannot follow yourself.");

      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: userIdToFollow });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User followed!");
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Could not follow user: ${error.message}`);
    },
  });
}

// Hook to unfollow a user
export function useUnfollowUser() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIdToUnfollow: string) => {
      if (!user) throw new Error("You must be logged in to unfollow users.");

      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: user.id, following_id: userIdToUnfollow });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User unfollowed.");
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Could not unfollow user: ${error.message}`);
    },
  });
}
