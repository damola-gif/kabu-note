
import { Heart, MessageSquare, Bookmark, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StrategyWithProfile } from '@/hooks/useStrategies';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from '@/contexts/SessionProvider';
import { useLikedStrategyIds, useBookmarkedStrategyIds } from '@/hooks/useStrategies';
import { useStrategyActions } from '@/hooks/useStrategyActions';
import { useFollowing } from '@/hooks/useProfile';
import { CommentSection } from '@/components/comments/CommentSection';
import { useState } from 'react';

interface FeedCardProps {
  strategy: StrategyWithProfile;
}

export function FeedCard({ strategy }: FeedCardProps) {
  const { user } = useSession();
  const { data: likedIds = [] } = useLikedStrategyIds();
  const { data: bookmarkedIds = [] } = useBookmarkedStrategyIds();
  const { data: followingIds = [] } = useFollowing();
  const { handleLikeToggle, handleBookmarkToggle, handleFollowToggle } = useStrategyActions();
  const [showComments, setShowComments] = useState(false);
  
  const isLiked = likedIds.includes(strategy.id);
  const isBookmarked = bookmarkedIds.includes(strategy.id);
  const isOwnStrategy = user?.id === strategy.user_id;
  const isFollowing = followingIds.includes(strategy.user_id);

  const handleViewStrategy = () => {
    window.open(`/strategies/${strategy.id}`, '_blank');
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Author Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={strategy.profile?.avatar_url || ''} />
              <AvatarFallback>
                {strategy.profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {strategy.profile?.username || 'Anonymous'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(strategy.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {!isOwnStrategy && user && (
            <Button 
              variant={isFollowing ? "secondary" : "outline"} 
              size="sm"
              onClick={() => handleFollowToggle(strategy.user_id, isFollowing)}
            >
              <Users className="mr-1 h-3 w-3" />
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        {/* Strategy Content */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold line-clamp-2">{strategy.name}</h3>
          
          {strategy.content_markdown && (
            <p className="text-muted-foreground line-clamp-3">
              {strategy.content_markdown.slice(0, 200)}...
            </p>
          )}

          {/* Tags */}
          {strategy.tags && strategy.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {strategy.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {strategy.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{strategy.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Strategy Stats */}
          {strategy.win_rate && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Win Rate: {strategy.win_rate}%</span>
            </div>
          )}

          {/* Chart Preview Placeholder */}
          {strategy.image_path && (
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Chart Preview</span>
            </div>
          )}
        </div>

        {/* Interaction Row */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeToggle(strategy.id, isLiked)}
              className={isLiked ? 'text-red-500' : ''}
              disabled={!user}
            >
              <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {strategy.likes_count || 0}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              disabled={!user}
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              {strategy.comments_count || 0}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBookmarkToggle(strategy.id, isBookmarked)}
              className={isBookmarked ? 'text-blue-500' : ''}
              disabled={!user}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleViewStrategy}>
            View Full Strategy
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <CommentSection strategyId={strategy.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
