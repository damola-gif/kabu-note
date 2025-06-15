
import { Button } from "@/components/ui/button";
import { Bell, Menu, Search } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { TraderSearch } from "@/components/search/TraderSearch";
import { Dispatch, SetStateAction } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  onMenuClick: () => void;
  navigationItems?: { name: string; path: string; }[];
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: Dispatch<SetStateAction<boolean>>;
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/80">
      <div className="container flex h-16 items-center justify-between px-6">
        
        {/* Left Group: Logo + Primary Nav */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6 text-cyan-400" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
            
            <span className="font-bold text-xl text-cyan-400 tracking-wide">
              KabuNote
            </span>
          </div>
          
          {/* Primary Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-all duration-200",
                  "hover:text-cyan-400 hover:bg-cyan-400/10 hover:shadow-lg hover:shadow-cyan-400/20",
                  location.pathname === item.path
                    ? "text-cyan-400 bg-cyan-400/10 shadow-md shadow-cyan-400/20"
                    : "text-slate-300"
                )}
              >
                {item.name}
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                )}
              </Button>
            ))}
          </nav>
        </div>

        {/* Center Group: Global Search - Large screens only */}
        <div className="flex-1 mx-8 hidden lg:block max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/60" />
            <input
              type="text"
              placeholder="Search strategies, trades..."
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-full px-10 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Group: Trader Search + Controls */}
        <div className="flex items-center space-x-4">
          {/* Trader Search - Desktop only */}
          <div className="hidden xl:block">
            <TraderSearch />
          </div>
          
          {/* Divider */}
          <div className="hidden xl:block w-px h-6 bg-slate-700/50" />
          
          {/* Control Icons */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="relative hover:bg-cyan-400/10 hover:text-cyan-400 transition-all duration-200 group"
            >
              <Bell className="h-5 w-5 text-slate-300 group-hover:text-cyan-400" />
              <span className="sr-only">Notifications</span>
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Button>
            
            <div className="hover:bg-cyan-400/10 rounded-md transition-all duration-200">
              <ThemeToggle />
            </div>
            
            <div className="pl-2 border-l border-slate-700/50">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
