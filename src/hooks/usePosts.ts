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
    refetchInterval: 30000,
  });

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
          queryClient.invalidateQueries({ queryKey: ['posts'] });
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
      if (!user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('Creating post with data:', postData);
      console.log('User ID:', user.id);

      const insertData = {
        user_id: user.id,
        content: postData.content || null,
        post_type: postData.post_type,
        media_url: postData.media_url || null,
        media_type: postData.media_type || null,
        link_url: postData.link_url || null,
        link_title: postData.link_title || null,
        link_description: postData.link_description || null,
        link_image: postData.link_image || null,
        hashtags: postData.hashtags || null,
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('posts')
        .insert(insertData)
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
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Post created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Post creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created successfully!');
    },
    onError: (error: any) => {
      console.error('Post creation failed:', error);
      
      let errorMessage = 'Failed to create post. Please try again.';
      
      if (error.message?.includes('duplicate key')) {
        errorMessage = 'Post already exists.';
      } else if (error.message?.includes('foreign key')) {
        errorMessage = 'User profile not found. Please refresh and try again.';
      } else if (error.message?.includes('not null')) {
        errorMessage = 'Required fields are missing.';
      }
      
      toast.error(errorMessage);
    },
    onSettled: () => {
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

      if (error) {
        console.error('Error fetching liked posts:', error);
        throw error;
      }
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

      console.log('Toggling like for post:', postId, 'isLiked:', isLiked);

      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        
        if (error) {
          console.error('Error unliking post:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: postId,
          });
        
        if (error) {
          console.error('Error liking post:', error);
          throw error;
        }
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['post-likes'] });

      // Snapshot the previous values
      const previousPosts = queryClient.getQueryData(['posts']);
      const previousLikes = queryClient.getQueryData(['post-likes', user?.id]);

      // Optimistically update likes
      queryClient.setQueryData(['post-likes', user?.id], (old: string[] | undefined) => {
        const currentLikes = old || [];
        if (isLiked) {
          return currentLikes.filter(id => id !== postId);
        } else {
          return [...currentLikes, postId];
        }
      });

      // Optimistically update post counts
      queryClient.setQueryData(['posts'], (old: Post[] | undefined) => {
        if (!old) return old;
        return old.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: isLiked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1
            };
          }
          return post;
        });
      });

      return { previousPosts, previousLikes };
    },
    onSuccess: () => {
      // Refresh data after successful mutation
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-likes'] });
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      if (context?.previousLikes) {
        queryClient.setQueryData(['post-likes', user?.id], context.previousLikes);
      }
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
      
      console.log('Deleting post:', postId);
      
      // First, delete all related post_likes
      const { error: likesError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId);

      if (likesError) {
        console.error('Error deleting post likes:', likesError);
        throw likesError;
      }

      // Get post media info for cleanup
      const { data: post, error: fetchErr } = await supabase
        .from('posts')
        .select('media_url')
        .eq('id', postId)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      // Delete media file if exists
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

      // Finally, delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }

      console.log('Post deleted successfully');
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
