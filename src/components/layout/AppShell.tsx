
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Bell, User, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";
import { useIsMobile } from "@/hooks/use-mobile";

// Simple top bar with notifications, avatar, and path title
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/journal": "Trade Journal",
  "/strategies": "Strategy Library",
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
  const { user } = useSession();
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed out successfully!");
      navigate("/auth");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        <SidebarInset className="flex-1 flex flex-col">
          <header className="flex items-center justify-between py-3 px-4 border-b bg-background/90 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              {/* Only show sidebar trigger on desktop */}
              <div className="hidden md:block">
                <SidebarTrigger />
              </div>
              <span className="font-bold text-lg">{title}</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Account</p>
                      {user && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          <main className={cn(
            "flex-1 overflow-y-auto p-4 sm:p-6 md:p-8",
            // Add bottom padding on mobile to account for bottom navigation
            isMobile && "pb-20"
          )}>
            {children}
          </main>
        </SidebarInset>
        
        {/* Mobile Bottom Navigation */}
        <MobileNavigation />
      </div>
    </SidebarProvider>
  );
}
