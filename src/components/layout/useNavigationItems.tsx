
import { useIsMobile } from "@/hooks/use-mobile";

export function useNavigationItems() {
  const isMobile = useIsMobile();

  const desktopItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Strategies", path: "/strategies" },
    { name: "Feed", path: "/feed" },
    { name: "Voting", path: "/following-strategies" },
    { name: "Journal", path: "/journal" },
    { name: "Rooms", path: "/rooms" },
  ];
  
  const mobileNavOrder = ["Dashboard", "Feed", "Voting", "Journal", "Rooms"];
  
  if (isMobile) {
    const mobileItems = desktopItems.filter(item => item.name !== 'Strategies');
    // The sort is to maintain a consistent order on mobile
    return mobileItems.sort((a,b) => mobileNavOrder.indexOf(a.name) - mobileNavOrder.indexOf(b.name));
  }
  
  return desktopItems;
}
