
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
    <div className="flex flex-row items-center gap-3 w-full">
      {/* Card */}
      <Card
        className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-md cursor-pointer flex-1 min-h-[78px] px-0"
        onClick={handleProfileClick}
      >
        <CardContent className="flex flex-row items-center gap-4 min-h-[78px] px-4 py-3">
          {/* Avatar */}
          <Avatar className="h-11 w-11 ring-0 bg-orange-100 text-orange-700">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
            <AvatarFallback className="bg-orange-100 text-orange-600 text-base font-semibold">
              {profile.full_name?.charAt(0).toUpperCase() ||
                profile.username?.charAt(0).toUpperCase() ||
                'U'}
            </AvatarFallback>
          </Avatar>
          {/* Name and username horizontally */}
          <div className="flex flex-col justify-center">
            <span
              className="font-medium text-base sm:text-lg text-gray-900 dark:text-white"
              style={{ wordBreak: 'break-word' }}
            >
              {profile.full_name ?? profile.username}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-300" style={{ wordBreak: 'break-word' }}>
              @{profile.username}
            </span>
          </div>
        </CardContent>
      </Card>
      {/* Follow/Unfollow button (outside the card) */}
      {!isOwnProfile && (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleFollowToggle();
          }}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          className="ml-1 min-w-[90px] h-[38px]"
        >
          {followMutation.isPending || unfollowMutation.isPending
            ? "..."
            : isFollowing
              ? "Unfollow"
              : "Follow"}
        </Button>
      )}
    </div>
  );
}
