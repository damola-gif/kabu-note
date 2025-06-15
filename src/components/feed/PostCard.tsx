
import { Heart, MessageSquare, Share, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from '@/contexts/SessionProvider';
import { usePostLikes, useTogglePostLike } from '@/hooks/usePosts';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const { data: likedPostIds = [] } = usePostLikes();
  const toggleLike = useTogglePostLike();
  
  const isLiked = likedPostIds.includes(post.id);

  const handleLikeToggle = () => {
    if (!user) return;
    toggleLike.mutate({ postId: post.id, isLiked });
  };

  const handleProfileClick = () => {
    if (post.profiles?.username) {
      navigate(`/u/${post.profiles.username}`);
    }
  };

  const renderMedia = () => {
    if (post.post_type === 'image' && post.media_url) {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden">
          <img 
            src={post.media_url} 
            alt="Post image" 
            className="w-full max-h-96 object-cover"
          />
        </div>
      );
    }

    if (post.post_type === 'video' && post.media_url) {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden">
          <video 
            src={post.media_url} 
            controls 
            className="w-full max-h-96"
          />
        </div>
      );
    }

    if (post.post_type === 'link' && post.link_url) {
      return (
        <div className="mt-3 border border-border rounded-2xl overflow-hidden hover:bg-muted/30 transition-colors">
          <a 
            href={post.link_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4"
          >
            <div className="flex items-start gap-3">
              {post.link_image && (
                <img 
                  src={post.link_image} 
                  alt="Link preview" 
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium line-clamp-1 text-sm">
                    {post.link_title || 'Link'}
                  </h4>
                  <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
                {post.link_description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {post.link_description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {new URL(post.link_url).hostname}
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
        {/* Author Info */}
        <div className="flex gap-3">
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles?.avatar_url || ''} />
              <AvatarFallback className="bg-muted">
                {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
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
                {post.profiles?.username || 'Anonymous'}
              </button>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Post Content */}
            {post.content && (
              <div className="mb-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            )}

            {/* Media Content */}
            {renderMedia()}

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {post.hashtags.map((tag) => (
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
                className="hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground h-8 px-3"
                disabled={!user}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="text-sm">{post.comments_count || 0}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeToggle}
                className={`hover:bg-red-500/10 hover:text-red-500 h-8 px-3 ${
                  isLiked ? 'text-red-500' : 'text-muted-foreground'
                }`}
                disabled={!user}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likes_count || 0}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-green-500/10 hover:text-green-500 text-muted-foreground h-8 px-3"
                disabled={!user}
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
