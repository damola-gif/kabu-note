
import { Home, Settings, Newspaper, User } from "lucide-react";

export const useMobileNavItems = () => {
  return [
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
      title: "Profile",
      url: "/profile", 
      icon: User,
    },
    {
      title: "Settings",
      url: "/settings", 
      icon: Settings,
    },
  ];
};
