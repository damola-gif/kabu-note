
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Edit } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSession } from "@/contexts/SessionProvider";
import { format } from "date-fns";

interface ProfileHeaderProps {
  profile: Tables<'profiles'>;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  isFollowLoading?: boolean;
}

export function ProfileHeader({ 
  profile, 
  isOwnProfile, 
  isFollowing, 
  onFollowToggle,
  isFollowLoading 
}: ProfileHeaderProps) {
  const { user } = useSession();

  return (
    <Card className="landing-card">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-24 w-24 mx-auto md:mx-0">
            <AvatarImage src={profile.avatar_url || ""} alt={profile.username || ""} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {profile.full_name?.charAt(0).toUpperCase() || 
               profile.username?.charAt(0).toUpperCase() || 
               user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-light">
              {profile.full_name || profile.username}
            </h1>
            {profile.full_name && (
              <p className="text-muted-foreground">@{profile.username}</p>
            )}
            
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                Joined {format(new Date(profile.updated_at || ''), 'MMMM yyyy')}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {isOwnProfile ? (
              <Button variant="outline" className="flex items-center gap-2 btn-landing-ghost">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <Button 
                onClick={onFollowToggle}
                disabled={isFollowLoading}
                variant={isFollowing ? "outline" : "default"}
                className={isFollowing ? "btn-landing-ghost" : "btn-landing-primary"}
              >
                {isFollowLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
