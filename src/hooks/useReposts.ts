
// Hook: useReposts
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
      if (!user) throw new Error('User not authenticated');

      // Prevent reposting own post (enforce logic in UI as well)
      const { data: orig } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', original_post_id)
        .maybeSingle();

      if (orig?.user_id === user.id) {
        throw new Error("You can't repost your own post.");
      }

      // Check for duplicate repost (only one per post per user)
      const { data: existing } = await supabase
        .from('reposts')
        .select('id')
        .eq('user_id', user.id)
        .eq('original_post_id', original_post_id)
        .maybeSingle();

      if (existing) {
        throw new Error('You have already reposted this post.');
      }

      const { data, error } = await supabase
        .from('reposts')
        .insert({
          user_id: user.id,
          original_post_id,
          repost_comment: repost_comment ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post shared (reposted)!');
    },
    onError: (err) => {
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
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('reposts')
        .delete()
        .eq('user_id', user.id)
        .eq('id', repostId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Repost deleted!');
    },
    onError: (err) => {
      toast.error(
        err?.message || 'Could not remove repost. Please try again.'
      );
    },
  });
}

// Query: Which posts has the user reposted?
export function useUserRepostedIds() {
  const { user } = useSession();
  return useQuery({
    queryKey: ['user-reposted-ids', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reposts')
        .select('original_post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((row) => row.original_post_id);
    },
    enabled: !!user,
  });
}
