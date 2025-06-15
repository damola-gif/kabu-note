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
      <main
        className={cn(
          "flex-1 relative z-10 min-h-[calc(100vh-56px)] pt-14",
          isMobile && "pb-20"
        )}
      >
        <div className="max-w-screen-2xl mx-auto w-full px-4 py-6 flex flex-col">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
