
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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

  const handleProfileClick = () => {
    navigate(`/u/${profile.username}`);
  };

  return (
    <Card
      className="w-full mx-auto p-0 flex items-center border border-gray-200 dark:border-border rounded-2xl shadow hover:shadow-lg transition-shadow duration-200 min-h-[84px] bg-white dark:bg-card"
      onClick={handleProfileClick}
      tabIndex={0}
      role="button"
    >
      <CardContent className="flex w-full items-center p-6 min-h-0 gap-4">
        {/* Avatar */}
        <Avatar className="h-14 w-14 ring-2 ring-orange-400/40 bg-orange-50 text-orange-600 shadow-sm flex-shrink-0">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
          <AvatarFallback className="bg-orange-100 text-orange-800 font-bold text-lg">
            {profile.full_name?.charAt(0).toUpperCase() ||
              profile.username?.charAt(0).toUpperCase() ||
              'U'}
          </AvatarFallback>
        </Avatar>
        {/* Names */}
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <span className="font-semibold text-[17px] leading-5 text-gray-900 dark:text-white truncate">
            {profile.full_name ?? profile.username}
          </span>
          <span className="text-base text-gray-400 dark:text-gray-300 leading-tight truncate">
            @{profile.username}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
