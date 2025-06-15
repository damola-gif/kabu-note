
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
                <div className="h-4 w-4 bg-gray-300 rounded mx-auto mb-2"></div>
                <div className="h-6 w-12 bg-gray-300 rounded mx-auto mb-1"></div>
                <div className="h-4 w-16 bg-gray-300 rounded mx-auto"></div>
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
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-[#2AB7CA]">{stats.followersCount}</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-[#2AB7CA]">{stats.followingCount}</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-[#2AB7CA]">{stats.strategiesCount}</div>
            <div className="text-sm text-gray-500">Strategies</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-[#2AB7CA]">{stats.totalLikes}</div>
            <div className="text-sm text-gray-500">Total Likes</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-[#2AB7CA]">
              {stats.avgWinRate ? `${stats.avgWinRate}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Avg Win Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
