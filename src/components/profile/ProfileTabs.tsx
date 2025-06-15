import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Activity, Users } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { SocialLists } from "./SocialLists";

interface ProfileTabsProps {
  strategies: Tables<'strategies'>[];
  isStrategiesLoading: boolean;
  profile: Tables<'profiles'>;
  stats: {
    followersCount: number;
    followingCount: number;
  };
}

export function ProfileTabs({ 
  strategies, 
  isStrategiesLoading, 
  profile,
  stats 
}: ProfileTabsProps) {
  const navigate = useNavigate();

  const handleStrategyClick = (strategyId: string) => {
    navigate(`/strategies/${strategyId}`);
  };

  return (
    <Tabs defaultValue="strategies" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-card">
        <TabsTrigger value="strategies" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Strategies ({strategies.length})
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="social" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Social
        </TabsTrigger>
      </TabsList>

      <TabsContent value="strategies" className="mt-6">
        {isStrategiesLoading ? (
          <Card className="landing-card">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse landing-card">
                    <CardContent className="pt-6">
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-muted rounded"></div>
                        <div className="h-4 w-16 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : strategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <Card 
                key={strategy.id} 
                className="landing-card hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/30"
                onClick={() => handleStrategyClick(strategy.id)}
              >
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2 text-lg">{strategy.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {strategy.content_markdown ? 
                      strategy.content_markdown.substring(0, 150) + (strategy.content_markdown.length > 150 ? '...' : '') 
                      : 'No description available'
                    }
                  </p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Win Rate: {strategy.win_rate ? `${strategy.win_rate}%` : 'N/A'}</span>
                    <span>{strategy.likes_count || 0} likes</span>
                  </div>
                  {strategy.tags && strategy.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {strategy.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {strategy.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{strategy.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="landing-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Strategies Yet</h3>
                <p className="text-muted-foreground">
                  {profile.username} hasn't published any strategies yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <Card className="landing-card">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Activity Feed</h3>
              <p className="text-muted-foreground">
                Activity feed coming soon! This will show recent likes, comments, and strategy publications.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="social" className="mt-6">
        <SocialLists userId={profile.id} stats={stats} />
      </TabsContent>
    </Tabs>
  );
}
