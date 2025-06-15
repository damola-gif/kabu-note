
import { useIsMobile } from "@/hooks/use-mobile";

export function useNavigationItems() {
  const isMobile = useIsMobile();

  const baseItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Feed", path: "/feed" },
    { name: "Profile", path: "/profile" },
    { name: "Settings", path: "/settings" },
  ];

  // Add Strategies only on desktop
  if (!isMobile) {
    return [
      baseItems[0], // Dashboard
      { name: "Strategies", path: "/strategies" },
      baseItems[1], // Feed
      baseItems[2], // Profile
      baseItems[3], // Settings
    ];
  }

  return baseItems;
}
