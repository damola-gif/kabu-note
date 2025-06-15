
import { Home, Settings, Newspaper } from "lucide-react";

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
      title: "Settings",
      url: "/settings", 
      icon: Settings,
    },
  ];
};
