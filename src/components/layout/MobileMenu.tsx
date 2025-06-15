
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
    <div className="md:hidden bg-white border-t border-gray-200">
      <div className="px-4 py-3 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={cn(
              "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
              currentPath === item.path
                ? "bg-[#2AB7CA] text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
