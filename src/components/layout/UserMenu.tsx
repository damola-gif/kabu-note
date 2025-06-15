
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, UserCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function UserMenu() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileClick = () => {
    if (profile?.username) {
      navigate(`/u/${profile.username}`);
    } else {
      navigate('/profile');
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-cyan-400/10 transition-all duration-200 group">
          <Avatar className="h-9 w-9 ring-2 ring-slate-700/50 group-hover:ring-cyan-400/50 transition-all duration-200">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || ''} />
            <AvatarFallback className="bg-slate-800 text-slate-300">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-slate-900/95 backdrop-blur-md border-slate-700/50 shadow-xl shadow-black/20" 
        align="end" 
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-slate-200">
              {profile?.full_name || profile?.username || 'User'}
            </p>
            <p className="text-xs leading-none text-slate-400">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700/50" />
        <DropdownMenuItem 
          onClick={handleProfileClick}
          className="hover:bg-cyan-400/10 hover:text-cyan-400 focus:bg-cyan-400/10 focus:text-cyan-400 text-slate-300"
        >
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="hover:bg-cyan-400/10 hover:text-cyan-400 focus:bg-cyan-400/10 focus:text-cyan-400 text-slate-300"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-700/50" />
        <DropdownMenuItem 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          className="hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400 text-slate-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
