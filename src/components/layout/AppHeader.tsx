
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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50">
      <div className="h-full max-w-screen-2xl mx-auto px-6">
        <div className="flex items-center justify-between h-full">
          
          {/* Left Group: Logo + Primary Nav */}
          <div className="flex items-center space-x-8 min-w-0 flex-shrink-0">
            {/* Mobile Menu Button + Logo */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-cyan-400 hover:bg-cyan-400/10"
                onClick={onMenuClick}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div 
                className="font-bold text-xl text-cyan-400 tracking-wide cursor-pointer hover:text-cyan-300 transition-colors"
                onClick={() => navigate('/')}
              >
                KabuNote
              </div>
            </div>
            
            {/* Primary Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "relative h-10 px-4 text-sm font-medium transition-all duration-200",
                    "hover:text-cyan-400 hover:bg-cyan-400/10",
                    location.pathname === item.path
                      ? "text-cyan-400 bg-cyan-400/10"
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

          {/* Center Group: Global Search */}
          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/60" />
              <input
                type="text"
                placeholder="Search strategies, trades..."
                className="w-full h-10 bg-slate-900/60 border border-slate-700/50 rounded-full px-10 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Group: Controls */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Trader Search - Desktop only */}
            <div className="hidden xl:block">
              <TraderSearch />
            </div>
            
            {/* Divider */}
            <div className="hidden xl:block w-px h-6 bg-slate-700/50" />
            
            {/* Action Icons */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="icon"
                className="relative h-10 w-10 hover:bg-cyan-400/10 hover:text-cyan-400 transition-all duration-200 group"
              >
                <Bell className="h-5 w-5 text-slate-300 group-hover:text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </Button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Divider */}
              <div className="w-px h-6 bg-slate-700/50 mx-2" />
              
              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
