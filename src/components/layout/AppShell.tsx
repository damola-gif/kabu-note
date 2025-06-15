
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
      {/* Geometric background effects */}
      <div className="geometric-lines fixed inset-0 pointer-events-none opacity-30" />
      
      {/* Header */}
      <AppHeader 
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
        "flex-1 pt-16 relative z-10",
        isMobile && "pb-20"
      )}>
        <div className="container mx-auto px-4 lg:px-6 py-6">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
