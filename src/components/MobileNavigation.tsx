
import { Home, Settings, Newspaper } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
