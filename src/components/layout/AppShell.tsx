
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Simple top bar with notifications, avatar, and path title
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/journal": "Trade Journal",
  "/strategies": "Strategies",
  "/feed": "Feed",
  "/analytics": "Analytics",
  "/settings": "Settings",
};
function getPageTitle(path: string) {
  if (path.startsWith("/u/")) return "Profile";
  if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  return "";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="flex items-center justify-between py-4 px-4 border-b bg-background/90 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="font-bold text-lg">{title}</span>
            </div>
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon">
                <Bell />
                {/* TODO: Notifications badge */}
              </Button>
              <div>
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                {/* TODO: Dropdown for profile/logout */}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
      {/* Mobile bottom nav placeholder - to implement in next step */}
    </SidebarProvider>
  );
}
