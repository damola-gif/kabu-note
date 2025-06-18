
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, TrendingUp, Users, Settings } from "lucide-react";

export function MobileNavigation() {
  const { pathname } = useLocation();

  const mobileNavItems = [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Journal", 
      url: "/journal",
      icon: BookOpen,
    },
    {
      title: "Strategies",
      url: "/strategies", 
      icon: TrendingUp,
    },
    {
      title: "Feed",
      url: "/feed",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings", 
      icon: Settings,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1E2A4E] border-t border-border z-50 safe-area-pb">
      <div className="flex justify-around items-center h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center px-2 py-2 text-xs font-medium transition-all duration-200 rounded-lg min-w-0 flex-1",
                isActive
                  ? "text-[#2AB7CA]"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1 flex-shrink-0")} />
              <span className="truncate w-full text-center leading-tight">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
