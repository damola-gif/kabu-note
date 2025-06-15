
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, BookOpen } from 'lucide-react';
import { useFollowing } from '@/hooks/useProfile';
import { useStrategyActions } from '@/hooks/useStrategyActions';
import { useSession } from '@/contexts/SessionProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function FeedSidebar() {
  const { user } = useSession();
  const { data: followingIds = [] } = useFollowing();
  const { handleFollowToggle } = useStrategyActions();

  // Fetch top traders based on strategy engagement
  const { data: topTraders = [] } = useQuery({
    queryKey: ['topTraders'],
    queryFn: async () => {
      const { data: strategies, error } = await supabase
        .from('strategies')
        .select(`
          user_id,
          likes_count,
          approval_votes,
          profiles(id, username, avatar_url)
        `)
        .eq('is_public', true);

      if (error) throw error;

      // Filter out strategies without valid profiles
      const validStrategies = strategies.filter(strategy => 
        strategy.profiles && strategy.profiles.username
      );

      // Group by user and calculate engagement score
      const userEngagement = new Map();
      
      validStrategies.forEach(strategy => {
        const userId = strategy.user_id;
        const profile = strategy.profiles;
        
        if (!userEngagement.has(userId)) {
          userEngagement.set(userId, {
            id: userId,
            username: profile.username,
            avatar: profile.avatar_url || '',
            totalLikes: 0,
            totalVotes: 0,
            strategiesCount: 0
          });
        }
        
        const user = userEngagement.get(userId);
        user.totalLikes += strategy.likes_count || 0;
        user.totalVotes += strategy.approval_votes || 0;
        user.strategiesCount += 1;
      });

      // Convert to array and sort by engagement score
      const traders = Array.from(userEngagement.values())
        .map(trader => ({
          ...trader,
          engagementScore: (trader.totalLikes * 2) + trader.totalVotes + (trader.strategiesCount * 5)
        }))
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 3);

      return traders;
    },
  });

  // Mock data for trending tags - could be fetched from database later
  const trendingTags = ['#SPY', '#Bitcoin', '#Swing', '#Scalping', '#Options'];

  return (
    <div className="space-y-6">
      {/* Trending Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trendingTags.map((tag) => (
            <Badge key={tag} variant="outline" className="mr-2 cursor-pointer hover:bg-accent">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Top Traders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4" />
            Top Traders This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topTraders.map((trader) => {
            const isFollowing = followingIds.includes(trader.id);
            const isOwnProfile = user?.id === trader.id;
            
            return (
              <div key={trader.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={trader.avatar} />
                    <AvatarFallback>{trader.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{trader.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {trader.totalLikes} likes • {trader.strategiesCount} strategies
                    </p>
                  </div>
                </div>
                {!isOwnProfile && user && (
                  <Button 
                    variant={isFollowing ? "secondary" : "outline"} 
                    size="sm"
                    onClick={() => handleFollowToggle(trader.id, isFollowing)}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* CTA Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <BookOpen className="mr-2 h-4 w-4" />
            Share Your Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Share your trading insights with the community and build your following.
          </p>
          <Button className="w-full" size="sm">
            Create Strategy
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
