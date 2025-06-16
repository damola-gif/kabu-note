
import { Heart, MessageSquare, Share, ExternalLink, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from '@/contexts/SessionProvider';
import { usePostLikes, useTogglePostLike } from '@/hooks/usePosts';
import { useNavigate } from 'react-router-dom';
import { useDeletePost } from '@/hooks/usePosts';
import { useState } from 'react';
import { useRepostPost, useUserRepostedIds, useDeleteRepost } from '@/hooks/useReposts';
import { RepostDialog } from './RepostDialog';

interface PostCardProps {
  post: any; // Accept both regular and repost objects
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useSession();
  const navigate = useNavigate();

  // Is this a repost?
  const isRepost = post?.__repost === true;
  // If repost, unwrap the original post and repost
  const original = isRepost ? post.post : post;
  const repost = isRepost ? post.repost : null;
  const repostUserProfile = isRepost ? post.repost_user_profile : null;

  const { data: likedPostIds = [] } = usePostLikes();
  const toggleLike = useTogglePostLike();
  const deletePost = useDeletePost();
  const { data: userRepostedIds = [] } = useUserRepostedIds();

  const isPostOwner = user?.id === original.user_id;
  const isLiked = likedPostIds.includes(original.id);
  const hasReposted = userRepostedIds.includes(original.id);

  // repost dialog states
  const [repostOpen, setRepostOpen] = useState(false);
  const repostPost = useRepostPost();
  const deleteRepost = useDeleteRepost();

  const handleLikeToggle = async () => {
    if (!user) return;
    try {
      await toggleLike.mutateAsync({ postId: original.id, isLiked });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRepostClick = () => {
    if (!user || isPostOwner || hasReposted) return;
    setRepostOpen(true);
  };

  const onConfirmRepost = async (comment: string) => {
    try {
      await repostPost.mutateAsync({ 
        original_post_id: original.id, 
        repost_comment: comment 
      });
      setRepostOpen(false);
    } catch (error) {
      console.error('Error creating repost:', error);
    }
  };

  const handleProfileClick = () => {
    const username = original.profiles?.username;
    if (username) {
      navigate(`/u/${username}`);
    }
  };

  const handleCommentClick = () => {
    // For now, just log - you can implement comment functionality later
    console.log('Comment clicked for post:', original.id);
  };

  // Get display name - prefer full_name, then username, then fallback
  const getDisplayName = (profile: any) => {
    if (profile?.full_name) return profile.full_name;
    if (profile?.username) return profile.username;
    return 'Anonymous';
  };

  // Get username for handle display
  const getUsername = (profile: any) => {
    return profile?.username || 'anonymous';
  };

  // Render the media as before, but on original
  const renderMedia = () => {
    if (original.post_type === 'image' && original.media_url) {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden">
          <img 
            src={original.media_url} 
            alt="Post image" 
            className="w-full max-h-96 object-cover"
          />
        </div>
      );
    }

    if (original.post_type === 'video' && original.media_url) {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden">
          <video 
            src={original.media_url} 
            controls 
            className="w-full max-h-96"
          />
        </div>
      );
    }

    if (original.post_type === 'link' && original.link_url) {
      return (
        <div className="mt-3 border border-border rounded-2xl overflow-hidden hover:bg-muted/30 transition-colors">
          <a 
            href={original.link_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4"
          >
            <div className="flex items-start gap-3">
              {original.link_image && (
                <img 
                  src={original.link_image} 
                  alt="Link preview" 
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium line-clamp-1 text-sm">
                    {original.link_title || 'Link'}
                  </h4>
                  <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
                {original.link_description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {original.link_description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {new URL(original.link_url).hostname}
                </p>
              </div>
            </div>
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="border-b border-border hover:bg-muted/30 transition-colors">
      <div className="p-4">
        {/* Repost Banner */}
        {isRepost && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Repeat className="h-4 w-4" />
            <Avatar className="h-6 w-6">
              <AvatarImage src={repostUserProfile?.avatar_url || ''} />
              <AvatarFallback>{getDisplayName(repostUserProfile)?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <span>
              <span className="font-bold">{getDisplayName(repostUserProfile)}</span> reposted
              <span className="mx-2">·</span>
              {formatDistanceToNow(new Date(repost.created_at), { addSuffix: true })}
            </span>
            {/* Delete button for own repost */}
            {user && repost.user_id === user.id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteRepost.mutate(repost.id)}
                className="ml-auto shrink-0"
                aria-label="Delete repost"
                disabled={deleteRepost.isPending}
              >
                <span className="sr-only">Delete</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )}
          </div>
        )}

        {/* Author Info */}
        <div className="flex gap-3">
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={original.profiles?.avatar_url || ''} />
              <AvatarFallback className="bg-muted">
                {getDisplayName(original.profiles)?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <button 
                onClick={handleProfileClick}
                className="font-bold text-sm hover:underline"
              >
                {getDisplayName(original.profiles)}
              </button>
              {original.profiles?.username && original.profiles?.full_name && (
                <>
                  <span className="text-muted-foreground text-sm">@{getUsername(original.profiles)}</span>
                </>
              )}
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(original.created_at), { addSuffix: true })}
              </span>
              {/* Delete Button (only owner, only for original posts) */}
              {!isRepost && isPostOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto shrink-0"
                  onClick={() => deletePost.mutate(original.id)}
                  disabled={deletePost.isPending}
                  aria-label="Delete post"
                >
                  <span className="sr-only">Delete</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>

            {/* If repost, show repost comment (if any) */}
            {isRepost && repost.repost_comment && (
              <div className="mb-2">
                <p className="italic text-muted-foreground text-sm">"{repost.repost_comment}"</p>
              </div>
            )}

            {/* Post Content */}
            {original.content && (
              <div className="mb-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {original.content}
                </p>
              </div>
            )}

            {/* Media Content */}
            {renderMedia()}

            {/* Hashtags */}
            {original.hashtags && original.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {original.hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Interaction Row */}
            <div className="flex items-center justify-between mt-3 max-w-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCommentClick}
                className="hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground h-8 px-3"
                disabled={!user}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="text-sm">{original.comments_count || 0}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeToggle}
                className={`hover:bg-red-500/10 hover:text-red-500 h-8 px-3 ${
                  isLiked ? 'text-red-500' : 'text-muted-foreground'
                }`}
                disabled={!user || toggleLike.isPending}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{original.likes_count || 0}</span>
              </Button>
              
              {/* Repost/Share Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepostClick}
                className={`hover:bg-green-500/10 hover:text-green-500 h-8 px-3 ${
                  hasReposted ? 'text-green-500' : 'text-muted-foreground'
                }`}
                disabled={!user || isPostOwner || hasReposted || repostPost.isPending}
                aria-label="Repost"
              >
                <Share className="h-4 w-4" />
                <span className="text-sm">{original.shares_count || 0}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Repost Dialog */}
      <RepostDialog
        open={repostOpen}
        onClose={() => setRepostOpen(false)}
        onRepost={onConfirmRepost}
        loading={repostPost.isPending}
      />
    </div>
  );
}
