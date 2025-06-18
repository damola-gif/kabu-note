
import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useUserProfile, useUserStats } from "@/hooks/useUserProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
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

function ProfileLayout({ children }: { children: React.ReactNode }) {
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

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userProfile, isLoading: userProfileLoading } = useUserProfile(profile?.username || '');
  const { data: stats, isLoading: statsLoading } = useUserStats(profile?.id || '');

  if (profileLoading || userProfileLoading || statsLoading) {
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

  if (!profile) {
    return (
      <ErrorState>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground">Unable to load your profile information.</p>
          </div>
        </div>
      </ErrorState>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="space-y-6">
            <ProfileHeader 
              profile={profile} 
              isOwnProfile={true}
            />
            {stats && (
              <ProfileStats 
                stats={stats}
                isLoading={false}
              />
            )}
            <ProfileTabs 
              userId={profile.id}
              username={profile.username || ''}
            />
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}
