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

  // DEBUGGING: Log what we get
  console.log("SocialLists - followers:", followers);
  console.log("SocialLists - following:", following);

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="landing-card">
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
    <Card className="landing-card">
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

  // ENHANCED DEBUGGING: show structure and problems with data
  const DebugBlock = () => (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-xs">
      <div className="mb-2">
        <strong>DEBUG: followers ({Array.isArray(followers) ? followers.length : 0})</strong>
        <pre style={{ overflowX: "auto", background: "#fffde7", padding: 8 }}>
          {JSON.stringify(followers, null, 2)}
        </pre>
        {Array.isArray(followers) && followers.length > 0 && (
          <div className="mt-2">
            <strong>Followers Entry Keys:</strong>
            <ul>
              {followers.map((f, idx) => (
                <li key={idx} className="mb-1">
                  {f && typeof f === "object"
                    ? Object.keys(f).join(", ")
                    : "not an object"}
                  {(!f?.profiles || typeof f.profiles !== "object") && (
                    <span className="text-red-500 ml-2">profiles missing</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        <strong>DEBUG: following ({Array.isArray(following) ? following.length : 0})</strong>
        <pre style={{ overflowX: "auto", background: "#fffde7", padding: 8 }}>
          {JSON.stringify(following, null, 2)}
        </pre>
        {Array.isArray(following) && following.length > 0 && (
          <div className="mt-2">
            <strong>Following Entry Keys:</strong>
            <ul>
              {following.map((f, idx) => (
                <li key={idx} className="mb-1">
                  {f && typeof f === "object"
                    ? Object.keys(f).join(", ")
                    : "not an object"}
                  {(!f?.profiles || typeof f.profiles !== "object") && (
                    <span className="text-red-500 ml-2">profiles missing</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-2">
        <strong>Expected:</strong> Each entry should have a <code>profiles</code> object.<br />
        <strong>Valid Following Count:</strong> {validFollowing.length}<br />
        <strong>Valid Followers Count:</strong> {validFollowers.length}
      </div>
    </div>
  );

  return (
    <div>
      {/* Debugging block - remove in production */}
      <DebugBlock />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Followers - keep original vertical list */}
        <Card className="landing-card">
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
