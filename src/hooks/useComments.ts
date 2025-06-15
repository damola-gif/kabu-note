
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionProvider';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type CommentWithProfile = Tables<'strategy_comments'> & {
  profile?: Pick<Tables<'profiles'>, 'id' | 'username' | 'avatar_url'> | null;
};

export function useComments(strategyId: string) {
  return useQuery({
    queryKey: ['comments', strategyId],
    queryFn: async (): Promise<CommentWithProfile[]> => {
      const { data: comments, error } = await supabase
        .from('strategy_comments')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!comments) return [];

      // Get unique user IDs
      const userIds = [...new Set(comments.map(c => c.user_id).filter(Boolean))];
      
      if (userIds.length === 0) {
        return comments.map(c => ({ ...c, profile: null }));
      }

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError.message);
        return comments.map(c => ({ ...c, profile: null }));
      }

      // Map profiles to comments
      const profilesById = new Map(profiles.map(p => [p.id, p]));

      return comments.map(comment => ({
        ...comment,
        profile: profilesById.get(comment.user_id) ?? null,
      }));
    },
    enabled: !!strategyId,
  });
}

export function useCreateComment() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ strategyId, content }: { strategyId: string; content: string }) => {
      if (!user) throw new Error('You must be logged in to comment');

      const { data, error } = await supabase
        .from('strategy_comments')
        .insert({
          strategy_id: strategyId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { strategyId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', strategyId] });
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
      toast.success('Comment added successfully!');
    },
    onError: (error) => {
      toast.error(`Error adding comment: ${error.message}`);
    },
  });
}
