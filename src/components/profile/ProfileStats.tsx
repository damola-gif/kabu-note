import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Heart, TrendingUp } from "lucide-react";

interface ProfileStatsProps {
  stats: {
    followersCount: number;
    followingCount: number;
    strategiesCount: number;
    totalLikes: number;
    avgWinRate: number | null;
  };
  isLoading: boolean;
}

export function ProfileStats({ stats, isLoading }: ProfileStatsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-4 w-4 bg-muted rounded mx-auto mb-2"></div>
                <div className="h-6 w-12 bg-muted rounded mx-auto mb-1"></div>
                <div className="h-4 w-16 bg-muted rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-light text-primary">{stats.followersCount}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-light text-primary">{stats.followingCount}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-light text-primary">{stats.strategiesCount}</div>
            <div className="text-sm text-muted-foreground">Strategies</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-light text-primary">{stats.totalLikes}</div>
            <div className="text-sm text-muted-foreground">Total Likes</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-light text-primary">
              {stats.avgWinRate ? `${stats.avgWinRate}%` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Win Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
