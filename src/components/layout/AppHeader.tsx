
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { TraderSearch } from "@/components/search/TraderSearch";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="mr-4 hidden md:flex">
          <span className="font-bold">KabuNote</span>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <TraderSearch />
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
