
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/contexts/SessionProvider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface MobileHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const [notificationCount] = useState(3); // Mock notification count

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-sm border-b border-gray-200">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 hover:bg-gray-100"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 text-[#1E2A4E]" />
        </Button>

        {/* Center: Screen Title */}
        <h1 className="text-lg font-semibold text-[#1E2A4E] truncate">
          {title}
        </h1>

        {/* Right: Notifications + Avatar */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-gray-100 relative"
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5 text-[#1E2A4E]" />
            {notificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#2AB7CA] rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              </div>
            )}
          </Button>
          
          <button onClick={handleProfileClick}>
            <Avatar className="h-8 w-8 ring-2 ring-[#2AB7CA]">
              <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
              <AvatarFallback className="bg-[#2AB7CA] text-white text-sm">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </header>
  );
}
