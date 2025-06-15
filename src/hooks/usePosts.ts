
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
      
      // Fetch all posts with profile data
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      console.log('Fetched posts:', data);

      // Fetch reposts with original post and user data
      const { data: reposts, error: repostsError } = await supabase
        .from('reposts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (repostsError) {
        console.error('Error fetching reposts:', repostsError);
        // Continue without reposts if there's an error
      }

      // Process reposts if available
      let repostObjects: any[] = [];
      if (reposts && reposts.length > 0) {
        const originalPostIds = reposts.map(r => r.original_post_id);
        
        if (originalPostIds.length > 0) {
          const { data: originalPosts } = await supabase
            .from('posts')
            .select(`
              *,
              profiles:user_id (
                username,
                avatar_url
              )
            `)
            .in('id', originalPostIds);

          const origMap: Record<string, any> = {};
          if (originalPosts) {
            originalPosts.forEach(p => {
              origMap[p.id] = p;
            });
          }

          repostObjects = reposts.map(repost => ({
            __repost: true,
            repost,
            post: origMap[repost.original_post_id],
            repost_user_profile: repost.profiles,
          }));
        }
      }

      // Merge and sort posts and reposts
      const postsWithProfiles = data.map(post => ({
        ...post,
        __repost: false,
      }));

      const merged = [...postsWithProfiles, ...repostObjects].sort((a, b) => {
        const aTime = a.__repost ? a.repost.created_at : a.created_at;
        const bTime = b.__repost ? b.repost.created_at : b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      return merged;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  });

  // Set up real-time subscriptions
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reposts',
        },
        (payload) => {
          console.log('Reposts change detected:', payload);
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
      if (!user) throw new Error('User not authenticated');

      console.log('Creating post:', postData);

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          ...postData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      console.log('Post created successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Immediately invalidate and refetch posts
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
