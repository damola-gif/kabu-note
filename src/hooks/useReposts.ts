
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionProvider';
import { toast } from 'sonner';

export interface Repost {
  id: string;
  user_id: string;
  original_post_id: string;
  repost_comment: string | null;
  created_at: string;
  user_profile?: {
    username: string | null;
    avatar_url: string | null;
  };
}

export function useRepostPost() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      original_post_id,
      repost_comment,
    }: {
      original_post_id: string;
      repost_comment?: string;
    }) => {
      console.log('Repost functionality not yet implemented');
      throw new Error("Repost functionality coming soon!");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post shared (reposted)!');
    },
    onError: (err: any) => {
      toast.error(
        err?.message || 'Could not share post. Please try again.'
      );
    },
  });
}

export function useDeleteRepost() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repostId: string) => {
      console.log('Delete repost functionality not yet implemented');
      throw new Error("Delete repost functionality coming soon!");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Repost deleted!');
    },
    onError: (err: any) => {
      toast.error(
        err?.message || 'Could not remove repost. Please try again.'
      );
    },
  });
}

// Query: Which posts has the user reposted? (returns empty array for now)
export function useUserRepostedIds() {
  const { user } = useSession();
  return useQuery({
    queryKey: ['user-reposted-ids', user?.id],
    queryFn: async () => {
      // Return empty array since reposts table doesn't exist yet
      return [];
    },
    enabled: !!user,
  });
}
