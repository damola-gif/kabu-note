
import { Home, Settings, Newspaper, BookOpen } from "lucide-react";

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
      title: "Journal",
      url: "/journal", 
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/settings", 
      icon: Settings,
    },
  ];
};
