
import { useParams } from "react-router-dom";
import { useUserProfile, useUserStats, useUserStrategies } from "@/hooks/useUserProfile";
import { useFollowing, useFollowUser, useUnfollowUser } from "@/hooks/useProfile";
import { useSession } from "@/contexts/SessionProvider";
import { PublicProfileHeader } from "@/components/profile/PublicProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";

export default function PublicProfile() {
  const { username } = useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();
  
  console.log("PublicProfile page - URL username:", username);
  console.log("PublicProfile page - current user:", user?.id);
  
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useUserProfile(username || '');
  const { data: stats, isLoading: isStatsLoading } = useUserStats(profile?.id || '');
  const { data: strategies, isLoading: isStrategiesLoading } = useUserStrategies(profile?.id || '');
  const { data: followingIds } = useFollowing();
  
  console.log("PublicProfile data:", profile);
  console.log("PublicProfile error:", profileError);
  console.log("Is loading:", isProfileLoading);
  
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  const isOwnProfile = user?.id === profile?.id;
  const canFollow = !isOwnProfile && !!user; // Can follow if not own profile and user is logged in
  const isFollowing = !!(profile?.id && followingIds?.includes(profile.id));
  
  const handleFollowToggle = () => {
    if (!profile?.id) {
      console.error('Profile ID is missing');
      return;
    }
    
    if (isFollowing) {
      unfollowMutation.mutate(profile.id, {
        onSuccess: () => {
          // Invalidate the user stats to update follower count
          queryClient.invalidateQueries({ queryKey: ["userStats", profile.id] });
        },
        onError: (error) => {
          console.error('Error unfollowing user:', error);
        }
      });
    } else {
      followMutation.mutate(profile.id, {
        onSuccess: () => {
          // Invalidate the user stats to update follower count
          queryClient.invalidateQueries({ queryKey: ["userStats", profile.id] });
        },
        onError: (error) => {
          console.error('Error following user:', error);
        }
      });
    }
  };

  if (isProfileLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading profile...</div>
        </div>
      </AppShell>
    );
  }

  if (profileError || !profile) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
              <p className="text-muted-foreground">
                The user "@{username}" doesn't exist or their profile is not available.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <PublicProfileHeader
          profile={profile}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
          isFollowLoading={followMutation.isPending || unfollowMutation.isPending}
          canFollow={canFollow}
        />
        {stats && (
          <ProfileStats
            stats={stats}
            isLoading={isStatsLoading}
          />
        )}
        <ProfileTabs
          strategies={strategies || []}
          isStrategiesLoading={isStrategiesLoading}
          profile={profile}
          stats={{
            followersCount: stats?.followersCount || 0,
            followingCount: stats?.followingCount || 0,
          }}
        />
      </div>
    </AppShell>
  );
}
