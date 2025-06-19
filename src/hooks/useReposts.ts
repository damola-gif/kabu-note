
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

// Query: Which posts has the user reposted? (returns empty array since reposts table doesn't exist)
export function useUserRepostedIds() {
  const { user } = useSession();
  return useQuery({
    queryKey: ['user-reposted-ids', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Gracefully handle missing reposts table by returning empty array
      try {
        const { data, error } = await supabase
          .from('reposts')
          .select('original_post_id')
          .eq('user_id', user.id);

        if (error) {
          // If table doesn't exist (404), return empty array silently
          if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
            console.log('Reposts table does not exist yet, returning empty array');
            return [];
          }
          throw error;
        }
        return data?.map(repost => repost.original_post_id) || [];
      } catch (error: any) {
        // Silently handle missing table
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('Reposts table does not exist yet, returning empty array');
          return [];
        }
        console.error('Error fetching user reposted IDs:', error);
        return [];
      }
    },
    enabled: !!user,
    retry: false, // Don't retry on 404 errors
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
}
