
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
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer min-h-[80px]"
      onClick={handleProfileClick}
    >
      <CardContent className="py-4 px-6 w-full flex flex-row items-center gap-4">
        {/* Avatar left */}
        <Avatar className="h-12 w-12 ring-2 ring-orange-500/20 hover:ring-orange-400/40 transition-all duration-200 shrink-0">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
          <AvatarFallback className="bg-orange-950/40 text-orange-200 text-lg font-semibold">
            {profile.full_name?.charAt(0).toUpperCase() ||
              profile.username?.charAt(0).toUpperCase() ||
              'U'}
          </AvatarFallback>
        </Avatar>
        {/* User text info, HORIZONTAL: name and username side by side */}
        <div
          className="
            flex flex-row items-center min-w-0 flex-1
            gap-2
            max-w-[65%] sm:max-w-[70%]
          "
          style={{ flexWrap: 'wrap' }} // allows name/username to wrap together on very small screens
        >
          <span
            className="font-semibold text-base text-orange-100 truncate"
            style={{ overflowWrap: 'anywhere', maxWidth: 150 }}
            title={profile.full_name ?? profile.username}
          >
            {profile.full_name ?? profile.username}
          </span>
          <span className="text-sm text-orange-300/70 truncate" style={{ overflowWrap: "anywhere" }}>
            @{profile.username}
          </span>
        </div>
        {/* Follow/Unfollow button on the right */}
        {!isOwnProfile && (
          <Button
            size="sm"
            variant={isFollowing ? 'outline' : 'default'}
            onClick={(e) => {
              e.stopPropagation(); // Prevents card click
              handleFollowToggle();
            }}
            disabled={followMutation.isPending || unfollowMutation.isPending}
            className="min-w-[90px] ml-2"
          >
            {followMutation.isPending || unfollowMutation.isPending
              ? "..."
              : isFollowing
              ? "Unfollow"
              : "Follow"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
