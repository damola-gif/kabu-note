
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserListItem } from "./UserListItem";

interface FollowingGridProps {
  following: any[];
  isLoading: boolean;
}

export function FollowingGrid({ following, isLoading }: FollowingGridProps) {
  if (isLoading) {
    // Show grid skeletons like StrategyGrid does
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
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
    return (
      <Card className="landing-card">
        <CardContent className="pt-6">
          <div className="text-center py-4 text-muted-foreground">
            Not following anyone yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {following.map((follow: any) => (
        <UserListItem
          key={follow.following_id}
          profile={follow.profiles}
        />
      ))}
    </div>
  );
}
