
import {
  Home,
  LayoutDashboard,
  ListChecks,
  BarChartBig,
  Settings,
  Activity,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  route: string;
}

const sidebarItems: SidebarItemProps[] = [
  {
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Dashboard",
    route: "/dashboard",
  },
  {
    icon: <ListChecks className="h-4 w-4" />,
    label: "Journal",
    route: "/journal",
  },
  {
    icon: <Activity className="h-4 w-4" />,
    label: "Feed",
    route: "/feed",
  },
  {
    icon: <Home className="h-4 w-4" />,
    label: "Strategies",
    route: "/strategies",
  },
  {
    icon: <BarChartBig className="h-4 w-4" />,
    label: "Analytics",
    route: "/analytics",
  },
];

export function AppSidebar() {
  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4">
      <div className="px-4 mb-4">
        <Button variant="ghost" className="font-bold w-full justify-start">
          KabuTrade
        </Button>
      </div>
      <div className="space-y-1">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.route}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-medium" : "text-gray-600"
              }`
            }
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="mt-auto px-4">
        <NavLink to="/settings">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </NavLink>
      </div>
    </div>
  );
}
