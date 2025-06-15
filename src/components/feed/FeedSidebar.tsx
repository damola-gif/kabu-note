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

function useLeaderboard() {
  // Fetch most approved strategies this week
  return useQuery({
    queryKey: ['leaderboard-week'],
    queryFn: async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('is_public', true)
        .gte('created_at', weekAgo.toISOString())
        .order('approval_votes', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });
}

export function FeedSidebar() {
  const { user } = useSession();
  const { data: followingIds = [] } = useFollowing();
  const { handleFollowToggle } = useStrategyActions();

  // Compute top traders by profitable trade or most voted strategy
  const { data: topTraders = [] } = useQuery({
    queryKey: ['topTradersNew'],
    queryFn: async () => {
      // 1) Most profitable trade
      const { data: trades } = await supabase
        .from("trades")
        .select("user_id, pnl")
        .not("pnl", "is", null);

      // Max PNL per user
      const maxPnlByUser = new Map();
      if (trades) {
        trades.forEach(({ user_id, pnl }) => {
          if (!maxPnlByUser.has(user_id) || pnl > maxPnlByUser.get(user_id)) {
            maxPnlByUser.set(user_id, pnl);
          }
        });
      }

      // 2) Most voted strategy (approved only)
      const { data: strategies } = await supabase
        .from("strategies")
        .select("user_id, approval_votes, voting_status")
        .eq("voting_status", "approved");

      const maxVotesByUser = new Map();
      if (strategies) {
        strategies.forEach(({ user_id, approval_votes }) => {
          if (!maxVotesByUser.has(user_id) || approval_votes > maxVotesByUser.get(user_id)) {
            maxVotesByUser.set(user_id, approval_votes);
          }
        });
      }

      // Merge into leaderboard tab: top 3 by max(pnl) or max(approval votes)
      const uniqueUserIds = new Set<string>([
        ...maxPnlByUser.keys(),
        ...maxVotesByUser.keys(),
      ]);
      if (uniqueUserIds.size === 0) {
        return [];
      }

      // Fetch profiles for those users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", Array.from(uniqueUserIds));

      return Array.from(uniqueUserIds)
        .map(userId => {
          const profile = profiles?.find(p => p.id === userId);
          return {
            id: userId,
            username: profile?.username ?? "anon",
            avatar: profile?.avatar_url ?? "",
            maxPnl: maxPnlByUser.get(userId) ?? 0,
            maxVotes: maxVotesByUser.get(userId) ?? 0,
          };
        })
        // Rank by highest PnL or most approval votes
        .sort((a, b) =>
          Math.max(b.maxPnl || 0, b.maxVotes || 0) - Math.max(a.maxPnl || 0, a.maxVotes || 0)
        )
        .slice(0, 3);
    },
  });

  // Mock data for trending tags - could be fetched from database later
  const trendingTags = ['#SPY', '#Bitcoin', '#Swing', '#Scalping', '#Options'];

  const { data: leaderboard, isLoading } = useLeaderboard();

  return (
    <div className="space-y-6">
      {/* Trending Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <TrendingUp className="mr-2 h-4 w-4 text-orange-400" />
            <span className="text-orange-400">Trending Tags</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trendingTags.map((tag) => (
            <Badge key={tag} variant="outline" className="mr-2 cursor-pointer hover:bg-orange-200 hover:text-orange-700 transition">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Top Traders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-orange-400" />
            <span className="text-orange-400">Top Traders</span>
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
                    <AvatarFallback>
                      {(trader.username?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-orange-600">
                      {trader.username}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Max PnL: <span className="text-orange-400 font-bold">{trader.maxPnl}</span>
                      {" • "}
                      Max Votes: <span className="text-orange-400 font-bold">{trader.maxVotes}</span>
                    </p>
                  </div>
                </div>
                {!isOwnProfile && user && (
                  <Button 
                    variant={isFollowing ? "secondary" : "outline"} 
                    size="sm"
                    className={
                      isFollowing
                        ? "bg-orange-200 text-orange-800"
                        : "border-orange-400 text-orange-400 hover:bg-orange-100"
                    }
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
            <BookOpen className="mr-2 h-4 w-4 text-orange-400" />
            <span className="text-orange-400">Share Your Strategy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400 mb-3">
            Share your trading insights with the community and build your following.
          </p>
          <Button className="w-full bg-orange-500 text-white hover:bg-orange-600" size="sm">
            Create Strategy
          </Button>
        </CardContent>
      </Card>

      <div className="bg-white dark:bg-card rounded-xl shadow border border-border p-4">
        <div className="text-base font-bold text-orange-400 mb-3">🏆 Top Strategies of the Week</div>
        {isLoading ? (
          <div className="text-zinc-400 text-sm">Loading...</div>
        ) : leaderboard?.length ? (
          <ol className="list-decimal ml-5 space-y-1">
            {leaderboard.map((s, idx) => (
              <li key={s.id} className="flex justify-between items-center">
                <span 
                  className="font-medium cursor-pointer text-orange-600 hover:underline"
                  onClick={() => window.open(`/strategies/${s.id}`, "_blank")}
                >
                  {s.name}
                </span>
                <span className="text-xs text-zinc-400 ml-2">{s.approval_votes} votes</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-zinc-400 text-sm">No strategies found.</div>
        )}
      </div>
    </div>
  );
}
