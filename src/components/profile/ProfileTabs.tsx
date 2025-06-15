
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Activity, Users } from "lucide-react";
import { StrategyGrid } from "@/components/strategy/StrategyGrid";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <Tabs defaultValue="strategies" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="strategies" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Strategies
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
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">Loading strategies...</div>
            </CardContent>
          </Card>
        ) : strategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{strategy.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {strategy.content_markdown?.substring(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Win Rate: {strategy.win_rate ? `${strategy.win_rate}%` : 'N/A'}</span>
                    <span>{strategy.likes_count} likes</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Strategies Yet</h3>
                <p className="text-gray-600">
                  {profile.username} hasn't published any strategies yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Activity Feed</h3>
              <p className="text-gray-600">
                Activity feed coming soon! This will show recent likes, comments, and strategy publications.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="social" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Followers ({stats.followersCount})</h3>
              <div className="text-center py-4">
                <p className="text-gray-600">Followers list coming soon!</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Following ({stats.followingCount})</h3>
              <div className="text-center py-4">
                <p className="text-gray-600">Following list coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
