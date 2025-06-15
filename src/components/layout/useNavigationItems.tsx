
import { useIsMobile } from "@/hooks/use-mobile";

export function useNavigationItems() {
  const isMobile = useIsMobile();

  const baseItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Feed", path: "/feed" },
    { name: "Settings", path: "/settings" },
  ];

  // Add Strategies only on desktop
  if (!isMobile) {
    return [
      baseItems[0], // Dashboard
      { name: "Strategies", path: "/strategies" },
      ...baseItems.slice(1), // Feed, Settings
    ];
  }

  return baseItems;
}
