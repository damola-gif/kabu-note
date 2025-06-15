import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionProvider';
import { toast } from 'sonner';

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  post_type: 'text' | 'image' | 'video' | 'link';
  media_url: string | null;
  media_type: string | null;
  link_url: string | null;
  link_title: string | null;
  link_description: string | null;
  link_image: string | null;
  hashtags: string[] | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
}

export interface CreatePostData {
  content?: string;
  post_type: 'text' | 'image' | 'video' | 'link';
  media_url?: string;
  media_type?: string;
  link_url?: string;
  link_title?: string;
  link_description?: string;
  link_image?: string;
  hashtags?: string[];
}

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile data separately for each post
      const postsWithProfiles = await Promise.all(
        data.map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', post.user_id)
            .single();
          
          return {
            ...post,
            profiles: profile || null
          };
        })
      );

      return postsWithProfiles as Post[];
    },
  });
}

export function useCreatePost() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreatePostData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          ...postData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created successfully!');
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    },
  });
}

export function usePostLikes() {
  const { user } = useSession();
  
  return useQuery({
    queryKey: ['post-likes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(like => like.post_id);
    },
    enabled: !!user,
  });
}

export function useTogglePostLike() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: postId,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-likes'] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like. Please try again.');
    },
  });
}

export function useDeletePost() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post. Please try again.');
    },
  });
}
