
import { Heart, MessageCircle, Users, TrendingUp, BookOpen } from "lucide-react";
import { format, parseISO } from "date-fns";
import { StrategyWithProfile } from "@/hooks/useStrategies";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/contexts/SessionProvider";

interface RecentActivityProps {
  strategies: StrategyWithProfile[];
}

export function RecentActivity({ strategies }: RecentActivityProps) {
  const navigate = useNavigate();
  const { user } = useSession();

  // Filter strategies to only include those created by the current user
  const userStrategies = strategies.filter(strategy => strategy.user_id === user?.id);

  // Generate activity items from the current user's data only
  const recentActivities = [
    // Recently published strategies by the current user
    ...userStrategies
      .filter(s => s.is_public)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map(strategy => ({
        id: `published-${strategy.id}`,
        type: "published" as const,
        message: `You published "${strategy.name}"`,
        timestamp: new Date(strategy.created_at),
        icon: TrendingUp,
        iconColor: "text-[#2AB7CA]",
        clickable: true,
        onClick: () => navigate(`/strategy/${strategy.id}`)
      })),
    
    // Current user's strategies with likes
    ...userStrategies
      .filter(s => s.likes_count > 0)
      .sort((a, b) => b.likes_count - a.likes_count)
      .slice(0, 2)
      .map(strategy => ({
        id: `likes-${strategy.id}`,
        type: "like" as const,
        message: `Your "${strategy.name}" strategy received ${strategy.likes_count} ${strategy.likes_count === 1 ? 'like' : 'likes'}`,
        timestamp: new Date(strategy.created_at),
        icon: Heart,
        iconColor: "text-red-500",
        clickable: true,
        onClick: () => navigate(`/strategy/${strategy.id}`)
      })),
    
    // Current user's strategies with comments
    ...userStrategies
      .filter(s => s.comments_count > 0)
      .sort((a, b) => b.comments_count - a.comments_count)
      .slice(0, 2)
      .map(strategy => ({
        id: `comments-${strategy.id}`,
        type: "comment" as const,
        message: `New ${strategy.comments_count === 1 ? 'comment' : 'comments'} on "${strategy.name}" (${strategy.comments_count})`,
        timestamp: new Date(strategy.created_at),
        icon: MessageCircle,
        iconColor: "text-green-500",
        clickable: true,
        onClick: () => navigate(`/strategy/${strategy.id}`)
      }))
  ]
  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  .slice(0, 6); // Show only the 6 most recent activities

  return (
    <div className="stat-card">
      <h3 className="text-lg font-light text-foreground mb-4 sm:mb-6">Your Activity</h3>
      
      {recentActivities.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {recentActivities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div 
                key={activity.id} 
                className={`flex items-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                  activity.clickable ? 'cursor-pointer' : ''
                }`}
                onClick={activity.clickable ? activity.onClick : undefined}
              >
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${activity.iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed break-words">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(activity.timestamp, "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8">
          <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <p className="text-muted-foreground mb-2 text-sm sm:text-base">No recent activity</p>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            Start creating strategies and trading to see your activity here
          </p>
        </div>
      )}
    </div>
  );
}
