
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserListItem } from "./UserListItem";

interface FollowingGridProps {
  following: any[];
  isLoading: boolean;
}

export function FollowingGrid({ following, isLoading }: FollowingGridProps) {
  if (isLoading && following.length === 0) {
    // Match StrategyGrid's loading pattern exactly
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
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
  }

  if (!following || following.length === 0) {
    // Match StrategyGrid's empty state pattern exactly
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <h2 className="text-lg sm:text-xl font-semibold">Not Following Anyone</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          This user isn't following anyone yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {following.map((follow: any) => (
        <UserListItem
          key={follow.following_id}
          profile={follow.profiles}
        />
      ))}
    </div>
  );
}
