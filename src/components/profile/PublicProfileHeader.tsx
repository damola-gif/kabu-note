
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";

interface PublicProfileHeaderProps {
  profile: Tables<'profiles'>;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  isFollowLoading?: boolean;
  canFollow: boolean;
}

export function PublicProfileHeader({ 
  profile, 
  isFollowing, 
  onFollowToggle,
  isFollowLoading,
  canFollow
}: PublicProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url || ""} alt={profile.username || ""} />
            <AvatarFallback className="text-xl">
              {profile.full_name?.charAt(0).toUpperCase() || 
               profile.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-semibold">
              {profile.full_name || profile.username}
            </h1>
            {profile.full_name && (
              <p className="text-muted-foreground">@{profile.username}</p>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                Joined {format(new Date(profile.updated_at || ''), 'MMMM yyyy')}
              </span>
            </div>
          </div>
          <div>
            {canFollow && (
              <Button 
                onClick={onFollowToggle}
                disabled={isFollowLoading}
                variant={isFollowing ? 'outline' : 'default'}
              >
                {isFollowLoading
                  ? 'Loading...'
                  : isFollowing
                  ? 'Unfollow'
                  : 'Follow'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
