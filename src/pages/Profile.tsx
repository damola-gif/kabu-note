
import { useParams } from "react-router-dom";
import { useUserProfile, useUserStats, useUserStrategies } from "@/hooks/useUserProfile";
import { useFollowing, useFollowUser, useUnfollowUser } from "@/hooks/useProfile";
import { useSession } from "@/contexts/SessionProvider";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useSession();
  const queryClient = useQueryClient();
  
  console.log("Profile page - URL username:", username);
  console.log("Profile page - current user:", user?.id);
  
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useUserProfile(username || '');
  const { data: stats, isLoading: isStatsLoading } = useUserStats(profile?.id || '');
  const { data: strategies, isLoading: isStrategiesLoading } = useUserStrategies(profile?.id || '');
  const { data: followingIds } = useFollowing();
  
  console.log("Profile data:", profile);
  console.log("Profile error:", profileError);
  console.log("Is loading:", isProfileLoading);
  
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  const isOwnProfile = user?.id === profile?.id;
  const isFollowing = !!(profile?.id && followingIds?.includes(profile.id));
  
  const handleFollowToggle = () => {
    if (!profile?.id) return;
    
    if (isFollowing) {
      unfollowMutation.mutate(profile.id, {
        onSuccess: () => {
          // Invalidate the user stats to update follower count
          queryClient.invalidateQueries({ queryKey: ["userStats", profile.id] });
        }
      });
    } else {
      followMutation.mutate(profile.id, {
        onSuccess: () => {
          // Invalidate the user stats to update follower count
          queryClient.invalidateQueries({ queryKey: ["userStats", profile.id] });
        }
      });
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <Card className="max-w-md landing-card">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
            <p className="text-muted-foreground">
              The user "@{username}" doesn't exist or their profile is not available.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Debug: Username from URL: "{username}"
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <ProfileHeader 
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
        isFollowLoading={followMutation.isPending || unfollowMutation.isPending}
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
  );
}
