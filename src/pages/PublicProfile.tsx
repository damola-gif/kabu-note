
import { useParams } from "react-router-dom";
import { useUserProfile, useUserStats } from "@/hooks/useUserProfile";
import { useFollowing, useFollowUser, useUnfollowUser } from "@/hooks/useProfile";
import { PublicProfileHeader } from "@/components/profile/PublicProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/SessionProvider";

function LoadingSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="border-x border-border min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="border-x border-border min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

function PublicProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="border-x border-border min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useSession();
  const { data: userProfile, isLoading } = useUserProfile(username || '');
  const { data: stats, isLoading: statsLoading } = useUserStats(userProfile?.id || '');
  const { data: following } = useFollowing();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isFollowing = following?.includes(userProfile?.id || '') || false;
  const canFollow = user && userProfile && user.id !== userProfile.id;
  const isFollowLoading = followUser.isPending || unfollowUser.isPending;

  const handleFollowToggle = () => {
    if (!userProfile) return;
    
    if (isFollowing) {
      unfollowUser.mutate(userProfile.id);
    } else {
      followUser.mutate(userProfile.id);
    }
  };

  if (isLoading || statsLoading) {
    return (
      <LoadingSkeleton>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </LoadingSkeleton>
    );
  }

  if (!userProfile) {
    return (
      <ErrorState>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
            <p className="text-muted-foreground">The user @{username} could not be found.</p>
          </div>
        </div>
      </ErrorState>
    );
  }

  return (
    <PublicProfileLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold">@{userProfile.username}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="space-y-6">
            <PublicProfileHeader 
              profile={userProfile}
              isFollowing={isFollowing}
              onFollowToggle={handleFollowToggle}
              isFollowLoading={isFollowLoading}
              canFollow={canFollow || false}
            />
            {stats && (
              <ProfileStats 
                stats={stats}
                isLoading={false}
              />
            )}
          </div>
        </div>
      </div>
    </PublicProfileLayout>
  );
}
