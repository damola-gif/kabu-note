
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
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full flex flex-col justify-between min-h-[220px] sm:min-h-[210px]"
      onClick={handleProfileClick}
    >
      <CardContent className="p-6 flex flex-col h-full justify-between">
        {/* ROW: avatar + user info */}
        <div className="flex flex-row gap-4 items-center w-full">
          <Avatar className="h-16 w-16 ring-2 ring-orange-500/20 hover:ring-orange-400/40 transition-all duration-200 shrink-0">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
            <AvatarFallback className="bg-orange-950/40 text-orange-200 text-lg font-semibold">
              {profile.full_name?.charAt(0).toUpperCase() ||
                profile.username?.charAt(0).toUpperCase() ||
                'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-base text-orange-100 truncate">
              {profile.full_name ?? profile.username}
            </span>
            <span className="text-sm text-orange-300/70 truncate">
              @{profile.username}
            </span>
          </div>
        </div>
        {/* BUTTON below info, inside the card */}
        {!isOwnProfile && (
          <div className="flex mt-7 w-full">
            <Button
              size="sm"
              variant={isFollowing ? 'outline' : 'default'}
              onClick={(e) => {
                e.stopPropagation(); // Prevents card click
                handleFollowToggle();
              }}
              disabled={followMutation.isPending || unfollowMutation.isPending}
              className="min-w-[110px] w-full"
            >
              {followMutation.isPending || unfollowMutation.isPending
                ? '...'
                : isFollowing
                ? 'Unfollow'
                : 'Follow'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
