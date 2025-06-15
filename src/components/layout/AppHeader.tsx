
import { Button } from "@/components/ui/button";
import { Bell, Menu, Search, User } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppHeaderProps {
  onMenuClick: () => void;
  navigationItems?: { name: string; path: string; }[];
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: Dispatch<SetStateAction<boolean>>;
}

interface TraderProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

export function AppHeader({ 
  onMenuClick,
  navigationItems = [],
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen 
}: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: traders = [], isLoading } = useQuery({
    queryKey: ['unifiedSearch', searchTerm],
    queryFn: async (): Promise<TraderProfile[]> => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  const handleTraderClick = (username: string) => {
    navigate(`/u/${username}`);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchTerm)}`);
      setShowResults(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.length >= 2);
  };

  const handleSearchFocus = () => {
    if (searchTerm.length >= 2) {
      setShowResults(true);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/90 backdrop-blur-md border-b border-orange-500/20">
      <div className="h-full max-w-screen-2xl mx-auto px-6">
        <div className="flex items-center justify-between h-full gap-6">
          
          {/* Left Group: Logo + Primary Nav */}
          <div className="flex items-center gap-8 min-w-0 flex-shrink-0">
            {/* Mobile Menu Button + Logo */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-orange-400 hover:bg-orange-500/10"
                onClick={onMenuClick}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div 
                className="font-bold text-xl text-orange-400 tracking-wide cursor-pointer hover:text-orange-300 transition-colors"
                onClick={() => navigate('/')}
              >
                KabuNote
              </div>
            </div>
            
            {/* Primary Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "relative h-10 px-4 text-sm font-medium transition-all duration-200",
                    "hover:text-orange-400 hover:bg-orange-500/10",
                    location.pathname === item.path
                      ? "text-orange-400 bg-orange-500/10"
                      : "text-orange-100/80"
                  )}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" />
                  )}
                </Button>
              ))}
            </nav>
          </div>

          {/* Center Group: Unified Search */}
          <div className="flex-1 max-w-md mx-4 hidden lg:block relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400/60" />
              <input
                type="text"
                placeholder="Search strategies or traders..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full h-10 bg-orange-950/20 border border-orange-500/30 rounded-full px-10 py-2 text-sm text-orange-100 placeholder-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200"
              />
            </form>
            
            {/* Search Results Dropdown */}
            {showResults && searchTerm.length >= 2 && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl shadow-black/20 border-orange-500/30 bg-black/95 backdrop-blur-md">
                <CardContent className="p-0">
                  {isLoading && (
                    <div className="px-4 py-3 text-sm text-orange-300/60">
                      Searching...
                    </div>
                  )}
                  
                  {!isLoading && traders.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-medium text-orange-300/60 bg-orange-950/20 border-b border-orange-500/20">
                        Traders
                      </div>
                      <ul>
                        {traders.map((trader) => (
                          <li
                            key={trader.id}
                            onClick={() => handleTraderClick(trader.username)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-orange-500/10 cursor-pointer transition-all duration-200 border-b border-orange-500/20 last:border-b-0 group"
                          >
                            <Avatar className="h-8 w-8 ring-2 ring-orange-500/30 group-hover:ring-orange-400/50 transition-all duration-200">
                              <AvatarImage src={trader.avatar_url || ''} alt={trader.username} />
                              <AvatarFallback className="bg-orange-950/40 text-orange-200">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-orange-100 group-hover:text-orange-400 transition-colors duration-200">
                                {trader.full_name || trader.username}
                              </p>
                              {trader.full_name && (
                                <p className="text-sm text-orange-300/60 truncate">
                                  @{trader.username}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {!isLoading && (
                    <div className="px-4 py-3 border-t border-orange-500/20">
                      <button
                        onClick={handleSearchSubmit}
                        className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        Search strategies for "{searchTerm}"
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Group: Controls */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon"
              className="relative h-10 w-10 hover:bg-orange-500/10 hover:text-orange-400 transition-all duration-200 group"
            >
              <Bell className="h-5 w-5 text-orange-100/80 group-hover:text-orange-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            </Button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Divider */}
            <div className="w-px h-6 bg-orange-500/30" />
            
            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
