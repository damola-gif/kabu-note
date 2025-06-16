import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionProvider';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
    full_name: string | null;
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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      console.log('Fetching posts...');
      
      // Fetch all posts with complete profile data
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      console.log('Fetched posts:', data);
      return data || [];
    },
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
  });

  // Set up real-time subscriptions with immediate query updates
  useEffect(() => {
    console.log('Setting up real-time posts subscription');

    const postsChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('Posts change detected:', payload);
          // Force immediate refetch
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          queryClient.refetchQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up posts subscription');
      supabase.removeChannel(postsChannel);
    };
  }, [queryClient]);

  return query;
}

export function useCreatePost() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreatePostData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating post:', postData);

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          ...postData,
        })
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      console.log('Post created successfully:', data);
      return data;
    },
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Get current user profile info
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url, full_name')
          .eq('id', user.id)
          .single();

        // Optimistically update the cache
        const optimisticPost: Post = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          content: newPost.content || null,
          post_type: newPost.post_type,
          media_url: newPost.media_url || null,
          media_type: newPost.media_type || null,
          link_url: newPost.link_url || null,
          link_title: newPost.link_title || null,
          link_description: newPost.link_description || null,
          link_image: newPost.link_image || null,
          hashtags: newPost.hashtags || null,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profiles: profile || {
            username: user.email?.split('@')[0] || 'User',
            avatar_url: null,
            full_name: null,
          },
        };

        queryClient.setQueryData(['posts'], (old: Post[] | undefined) => {
          return [optimisticPost, ...(old || [])];
        });
      }

      return { previousPosts };
    },
    onSuccess: (data) => {
      // Force immediate refetch to get the real data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.refetchQueries({ queryKey: ['posts'] });
      toast.success('Post created successfully!');
    },
    onError: (error, newPost, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    },
    onSettled: () => {
      // Always refetch after success or error
      queryClient.invalidateQueries({ queryKey: ['posts'] });
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
      
      const { data: post, error: fetchErr } = await supabase
        .from('posts')
        .select('media_url')
        .eq('id', postId)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (post?.media_url) {
        try {
          const urlParts = post.media_url.split('/object/buckets/post_media/objects/');
          if (urlParts.length === 2) {
            const filePath = decodeURIComponent(urlParts[1]);
            await supabase.storage.from('post_media').remove([filePath]);
          } else {
            const match = post.media_url.match(/post_media\/(.+)$/);
            if (match) {
              await supabase.storage.from('post_media').remove([match[1]]);
            }
          }
        } catch (err) {
          console.warn('Error deleting post image:', err);
        }
      }

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
