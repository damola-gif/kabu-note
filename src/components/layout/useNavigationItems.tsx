
import { useIsMobile } from "@/hooks/use-mobile";

export function useNavigationItems() {
  const isMobile = useIsMobile();

  const baseItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Feed", path: "/feed" },
    { name: "Journal", path: "/journal" },
  ];

  // Add Strategies only on desktop
  if (!isMobile) {
    return [
      baseItems[0], // Dashboard
      { name: "Strategies", path: "/strategies" },
      baseItems[1], // Feed
      baseItems[2], // Journal
    ];
  }

  return baseItems;
}
