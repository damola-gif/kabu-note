
import { useIsMobile } from "@/hooks/use-mobile";

export function useNavigationItems() {
  const isMobile = useIsMobile();

  const baseItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Feed", path: "/feed" },
    { name: "Journal", path: "/journal" },
    { name: "Rooms", path: "/rooms" },
  ];

  if (!isMobile) {
    // Insert "Strategies" for desktop view
    const desktopItems = [...baseItems];
    const feedIndex = desktopItems.findIndex(item => item.name === 'Feed');
    desktopItems.splice(feedIndex, 0, { name: "Strategies", path: "/strategies" });
    
    // Reorder to match previous structure
    const orderedDesktopItems = [
      desktopItems.find(i => i.name === 'Dashboard'),
      desktopItems.find(i => i.name === 'Strategies'),
      desktopItems.find(i => i.name === 'Feed'),
      desktopItems.find(i => i.name === 'Journal'),
      desktopItems.find(i => i.name === 'Rooms'),
    ].filter(Boolean) as { name: string, path: string }[];
    
    return orderedDesktopItems;
  }
  
  const mobileNavOrder = ["Dashboard", "Feed", "Journal", "Rooms"];
  return baseItems.sort((a,b) => mobileNavOrder.indexOf(a.name) - mobileNavOrder.indexOf(b.name));
}
