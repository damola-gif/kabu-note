
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
import { AppShell } from "@/components/layout/AppShell";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // If no username in URL and user is logged in, redirect to their profile
  useEffect(() => {
    if (!username && user) {
      // We need to get the user's username from their profile
      const fetchAndRedirect = async () => {
        try {
          const { data: profile } = await queryClient.fetchQuery({
            queryKey: ['userProfile', user.id],
            queryFn: async () => {
              const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();
              
              if (error) throw error;
              return data;
            }
          });
          
          if (profile?.username) {
            navigate(`/u/${profile.username}`, { replace: true });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      
      fetchAndRedirect();
    }
  }, [username, user, navigate, queryClient]);
  
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
        <div className="flex flex-col h-full w-full items-center justify-center">
          <div className="text-lg">Loading profile...</div>
        </div>
      </AppShell>
    );
  }

  if (profileError || !profile) {
    return (
      <AppShell>
        <div className="flex flex-col h-full w-full items-center justify-center">
          <Card className="max-w-md landing-card">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
              <p className="text-muted-foreground">
                The user "@{username}" doesn't exist or their profile is not available.
              </p>
              {profileError && (
                <p className="text-sm text-destructive mt-2">
                  Error: {profileError.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
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
    </AppShell>
  );
}
