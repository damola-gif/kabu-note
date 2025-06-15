
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  navigationItems: Array<{ name: string; path: string }>;
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

export function MobileMenu({ navigationItems, isOpen, onClose, currentPath }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="px-4 py-3 space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={cn(
              "block px-4 py-3 text-sm font-medium rounded-lg transition-colors",
              currentPath === item.path
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent/50"
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
