import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useFollowersList, useFollowingList } from "@/hooks/useFollowersLists";
import { UserListItem } from "./UserListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { FollowingGrid } from "./FollowingGrid";

interface SocialListsProps {
  userId: string;
  stats: {
    followersCount: number;
    followingCount: number;
  };
}

export function SocialLists({ userId, stats }: SocialListsProps) {
  const { data: followers, isLoading: isLoadingFollowers } = useFollowersList(userId);
  const { data: following, isLoading: isLoadingFollowing } = useFollowingList(userId);

  // Enhanced logging to understand the data flow
  console.log("SocialLists - userId:", userId);
  console.log("SocialLists - stats:", stats);
  console.log("SocialLists - followers data:", followers);
  console.log("SocialLists - following data:", following);
  console.log("SocialLists - isLoadingFollowers:", isLoadingFollowers);
  console.log("SocialLists - isLoadingFollowing:", isLoadingFollowing);

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = ({ title }: { title: string }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-4">
          <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">{title}</p>
        </div>
      </CardContent>
    </Card>
  );

  // Use the same data filtering logic as strategies - ensure we have valid arrays with proper data
  const validFollowing = Array.isArray(following) ? following.filter(
    (follow) => follow && typeof follow === "object" && follow.profiles && typeof follow.profiles === "object"
  ) : [];

  const validFollowers = Array.isArray(followers) ? followers.filter(
    (follow) => follow && typeof follow === "object" && follow.profiles && typeof follow.profiles === "object"
  ) : [];

  console.log("SocialLists - validFollowing:", validFollowing);
  console.log("SocialLists - validFollowers:", validFollowers);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Followers - keep original vertical list */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Followers ({stats.followersCount})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoadingFollowers ? (
                <LoadingSkeleton />
              ) : validFollowers.length > 0 ? (
                validFollowers.map((follow: any, idx: number) => (
                  <UserListItem
                    key={follow.follower_id || idx}
                    profile={follow.profiles}
                  />
                ))
              ) : (
                <EmptyState title="No followers yet" />
              )}
            </div>
          </CardContent>
        </Card>
        {/* Following as a grid */}
        <div>
          <h3 className="font-semibold mb-4">Following ({stats.followingCount})</h3>
          <FollowingGrid following={validFollowing} isLoading={isLoadingFollowing} />
        </div>
      </div>
    </div>
  );
}
