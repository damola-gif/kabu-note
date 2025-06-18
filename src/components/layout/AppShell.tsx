
import { useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavigation } from "@/components/MobileNavigation";
import { MobileHeader } from "./MobileHeader";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { MobileMenu } from "./MobileMenu";
import { useNavigationItems } from "./useNavigationItems";

// Map routes to page titles
const getPageTitle = (pathname: string): string => {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/journal') return 'Trade Journal';
  if (pathname === '/strategies') return 'Strategies';
  if (pathname === '/feed') return 'Feed';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/profile') return 'Profile';
  if (pathname === '/notifications') return 'Notifications';
  if (pathname.startsWith('/u/')) return 'Profile';
  return 'KabuNote';
};

export function AppShell() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigationItems = useNavigationItems();

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen w-full bg-[#F5F7FA]">
      {/* Header - Mobile vs Desktop */}
      {isMobile ? (
        <MobileHeader
          title={pageTitle}
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      ) : (
        <AppHeader
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          navigationItems={navigationItems}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}

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
          "flex-1 pt-16 min-h-screen",
          isMobile && "pb-20"
        )}
      >
        <div className={cn(
          "w-full h-full",
          isMobile ? "px-4 py-4" : "max-w-screen-2xl mx-auto px-6 py-8"
        )}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
