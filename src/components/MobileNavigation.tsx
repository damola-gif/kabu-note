
import { Home, Settings, Newspaper, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Strategies",
    url: "/strategies",
    icon: TrendingUp,
  },
  {
    title: "Feed",
    url: "/feed",
    icon: Newspaper,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function MobileNavigation() {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 safe-area-pb">
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
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1 flex-shrink-0", isActive && "text-primary")} />
              <span className="truncate w-full text-center leading-tight">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
