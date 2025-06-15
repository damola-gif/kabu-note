
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { MobileMenu } from "./MobileMenu";
import { useNavigationItems } from "./useNavigationItems";

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigationItems = useNavigationItems();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Header */}
      <AppHeader
        onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        navigationItems={navigationItems}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Mobile Navigation Menu */}
      <MobileMenu
        navigationItems={navigationItems}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPath={location.pathname}
      />

      {/* Main Content */}
      <main className={cn(
        "flex-1 relative z-10 min-h-[calc(100vh-56px)]",
        "pt-16 sm:pt-20", // More space for header to not overlap
        isMobile && "pb-20"
      )}>
        <div className={cn(
          "mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 w-full max-w-screen-2xl"
        )}>
          {children}
        </div>
      </main>
      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
