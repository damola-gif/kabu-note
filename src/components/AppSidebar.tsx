
import {
  Home,
  LayoutDashboard,
  ListChecks,
  BarChartBig,
  User,
  Settings,
  Activity,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { user } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      if (user) {
        console.log("Fetching profile for user:", user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          console.log("Profile data:", data);
          setProfile(data);
        }
      }
    };

    getProfile();
  }, [user]);

  const handleProfileClick = () => {
    console.log("Profile click - profile data:", profile);
    if (profile?.username) {
      console.log("Navigating to:", `/u/${profile.username}`);
      navigate(`/u/${profile.username}`);
    } else {
      console.log("No username found, redirecting to settings");
      navigate('/settings');
      toast.info("Please set up your username in settings first");
    }
  };

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
        <Button variant="secondary" className="w-full justify-start mb-2" onClick={handleProfileClick}>
          <User className="h-4 w-4 mr-2" />
          Profile
        </Button>
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
