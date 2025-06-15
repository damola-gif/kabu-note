
import { Heart, MessageSquare, Share, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from '@/contexts/SessionProvider';
import { usePostLikes, useTogglePostLike } from '@/hooks/usePosts';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useSession();
  const { data: likedPostIds = [] } = usePostLikes();
  const toggleLike = useTogglePostLike();
  
  const isLiked = likedPostIds.includes(post.id);

  const handleLikeToggle = () => {
    if (!user) return;
    toggleLike.mutate({ postId: post.id, isLiked });
  };

  const renderMedia = () => {
    if (post.post_type === 'image' && post.media_url) {
      return (
        <div className="w-full mt-3">
          <img 
            src={post.media_url} 
            alt="Post image" 
            className="w-full max-h-96 object-cover rounded-lg"
          />
        </div>
      );
    }

    if (post.post_type === 'video' && post.media_url) {
      return (
        <div className="w-full mt-3">
          <video 
            src={post.media_url} 
            controls 
            className="w-full max-h-96 rounded-lg"
          />
        </div>
      );
    }

    if (post.post_type === 'link' && post.link_url) {
      return (
        <div className="mt-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <a 
            href={post.link_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex items-start gap-3">
              {post.link_image && (
                <img 
                  src={post.link_image} 
                  alt="Link preview" 
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium line-clamp-1">
                    {post.link_title || 'Link'}
                  </h4>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
                {post.link_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
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
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Author Info */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles?.avatar_url || ''} />
            <AvatarFallback>
              {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {post.profiles?.username || 'Anonymous'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Post Content */}
        {post.content && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        )}

        {/* Media Content */}
        {renderMedia()}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.hashtags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Interaction Row */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeToggle}
              className={isLiked ? 'text-red-500' : ''}
              disabled={!user}
            >
              <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {post.likes_count || 0}
            </Button>
            
            <Button variant="ghost" size="sm" disabled={!user}>
              <MessageSquare className="mr-1 h-4 w-4" />
              {post.comments_count || 0}
            </Button>
            
            <Button variant="ghost" size="sm" disabled={!user}>
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
