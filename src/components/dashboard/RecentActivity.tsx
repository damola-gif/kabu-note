
import { Heart, MessageCircle, Users, TrendingUp, BookOpen } from "lucide-react";
import { format, parseISO } from "date-fns";
import { StrategyWithProfile } from "@/hooks/useStrategies";
import { useNavigate } from "react-router-dom";

interface RecentActivityProps {
  strategies: StrategyWithProfile[];
}

export function RecentActivity({ strategies }: RecentActivityProps) {
  const navigate = useNavigate();

  // Generate activity items from real data
  const recentActivities = [
    // Recently published strategies
    ...strategies
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
    
    // Strategies with likes (mock data based on likes_count)
    ...strategies
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
    
    // Strategies with comments (mock data based on comments_count)
    ...strategies
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
      <h3 className="text-lg font-light text-foreground mb-6">Your Activity</h3>
      
      {recentActivities.length > 0 ? (
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div 
                key={activity.id} 
                className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                  activity.clickable ? 'cursor-pointer' : ''
                }`}
                onClick={activity.clickable ? activity.onClick : undefined}
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconComponent className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">
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
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No recent activity</p>
          <p className="text-sm text-muted-foreground">
            Start creating strategies and trading to see your activity here
          </p>
        </div>
      )}
    </div>
  );
}
