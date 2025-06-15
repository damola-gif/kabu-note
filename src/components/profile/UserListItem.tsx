import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/contexts/SessionProvider";
import { useFollowing, useFollowUser, useUnfollowUser } from "@/hooks/useProfile";

interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface UserListItemProps {
  profile: UserProfile;
}

export function UserListItem({ profile }: UserListItemProps) {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: followingIds } = useFollowing();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const isOwnProfile = user?.id === profile.id;
  const isFollowing = !!(profile.id && followingIds?.includes(profile.id));

  const handleFollowToggle = () => {
    if (!profile.id) return;
    if (isFollowing) {
      unfollowMutation.mutate(profile.id);
    } else {
      followMutation.mutate(profile.id);
    }
  };

  const handleProfileClick = () => {
    navigate(`/u/${profile.username}`);
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer min-h-[156px] md:min-h-[128px] w-full"
      onClick={handleProfileClick}
    >
      <CardContent className="py-6 px-8 w-full flex flex-row items-start gap-5">
        {/* Avatar left */}
        <Avatar className="h-14 w-14 ring-2 ring-orange-500/20 hover:ring-orange-400/40 transition-all duration-200 shrink-0">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
          <AvatarFallback className="bg-orange-950/40 text-orange-200 text-lg font-semibold">
            {profile.full_name?.charAt(0).toUpperCase() ||
              profile.username?.charAt(0).toUpperCase() ||
              'U'}
          </AvatarFallback>
        </Avatar>
        {/* User info section - name horizontal, button below */}
        <div className="flex flex-col flex-1 min-w-0 gap-4 justify-center">
          {/* Name and username horizontally */}
          <div className="flex flex-row items-center gap-4 flex-wrap">
            <span 
              className="font-semibold text-lg sm:text-xl text-orange-100 break-all"
              style={{ wordBreak: 'break-word' }}
            >
              {profile.full_name ?? profile.username}
            </span>
            <span className="text-base sm:text-lg text-orange-300/70 break-all">
              @{profile.username}
            </span>
          </div>
          {/* Follow/Unfollow button below */}
          {!isOwnProfile && (
            <Button
              size="sm"
              variant={isFollowing ? 'outline' : 'default'}
              onClick={(e) => {
                e.stopPropagation();
                handleFollowToggle();
              }}
              disabled={followMutation.isPending || unfollowMutation.isPending}
              className="min-w-[100px] mt-2"
            >
              {followMutation.isPending || unfollowMutation.isPending
                ? "..."
                : isFollowing
                ? "Unfollow"
                : "Follow"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
