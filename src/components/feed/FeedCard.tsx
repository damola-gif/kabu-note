import { Heart, MessageSquare, Bookmark, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useNavigate } from 'react-router-dom';
import { useDeleteStrategy } from '@/hooks/useStrategiesCRUD';

interface FeedCardProps {
  strategy: StrategyWithProfile;
}

export function FeedCard({ strategy }: FeedCardProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const { data: likedIds = [] } = useLikedStrategyIds();
  const { data: bookmarkedIds = [] } = useBookmarkedStrategyIds();
  const { data: followingIds = [] } = useFollowing();
  const { handleLikeToggle, handleBookmarkToggle, handleFollowToggle } = useStrategyActions();
  const [showComments, setShowComments] = useState(false);
  const deleteStrategy = useDeleteStrategy();
  const isOwnStrategy = user?.id === strategy.user_id;
  
  const isLiked = likedIds.includes(strategy.id);
  const isBookmarked = bookmarkedIds.includes(strategy.id);
  const isOwnStrategy = user?.id === strategy.user_id;
  const isFollowing = followingIds.includes(strategy.user_id);

  const handleViewStrategy = () => {
    window.open(`/strategies/${strategy.id}`, '_blank');
  };

  const handleProfileClick = () => {
    if (strategy.profile?.username) {
      navigate(`/u/${strategy.profile.username}`);
    }
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
              <AvatarImage src={strategy.profile?.avatar_url || ''} />
              <AvatarFallback className="bg-muted">
                {strategy.profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleProfileClick}
                  className="font-bold text-sm hover:underline"
                >
                  {strategy.profile?.username || 'Anonymous'}
                </button>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(strategy.created_at), { addSuffix: true })}
                </span>
              </div>
              {/* Delete Button (only for own strategy) */}
              {isOwnStrategy && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto shrink-0"
                  onClick={() => deleteStrategy.mutate(strategy.id)}
                  disabled={deleteStrategy.isPending}
                  aria-label="Delete strategy"
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

            {/* Strategy Content */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold leading-tight">{strategy.name}</h3>
              
              {strategy.content_markdown && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {strategy.content_markdown.slice(0, 280)}...
                </p>
              )}

              {/* Strategy Stats */}
              {strategy.win_rate && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    <span className="font-medium">{strategy.win_rate}% Win Rate</span>
                  </div>
                </div>
              )}

              {/* Tags */}
              {strategy.tags && strategy.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {strategy.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                      #{tag}
                    </Badge>
                  ))}
                  {strategy.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{strategy.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Chart Preview Placeholder */}
              {strategy.image_path && (
                <div className="w-full h-48 bg-muted rounded-2xl flex items-center justify-center border border-border">
                  <span className="text-muted-foreground text-sm">Chart Preview</span>
                </div>
              )}
            </div>

            {/* Interaction Row */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center max-w-md justify-between flex-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowComments(!showComments)}
                  className="hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground h-8 px-3"
                  disabled={!user}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="text-sm">{strategy.comments_count || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeToggle(strategy.id, isLiked)}
                  className={`hover:bg-red-500/10 hover:text-red-500 h-8 px-3 ${
                    isLiked ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                  disabled={!user}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{strategy.likes_count || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBookmarkToggle(strategy.id, isBookmarked)}
                  className={`hover:bg-blue-500/10 h-8 px-3 ${
                    isBookmarked ? 'text-blue-500' : 'text-muted-foreground hover:text-blue-500'
                  }`}
                  disabled={!user}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewStrategy}
                className="h-7 px-3 text-xs"
              >
                View Strategy
              </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-border">
                <CommentSection strategyId={strategy.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
