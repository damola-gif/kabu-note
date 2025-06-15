
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionProvider";

export function useNavigationItems() {
  const { user } = useSession();
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile to get username
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching profile:", error);
        } else if (data) {
          setUserProfile(data);
        }
      }
    };

    fetchProfile();
  }, [user]);

  // Generate profile URL based on username
  const getProfileUrl = () => {
    const trimmedUsername = typeof userProfile?.username === "string"
      ? userProfile.username.trim()
      : "";
    
    if (!trimmedUsername || trimmedUsername.length < 3 || trimmedUsername.toLowerCase() === "profile") {
      return "/settings"; // Redirect to settings if no valid username
    }
    
    return `/u/${trimmedUsername}`;
  };

  const navigationItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Journal", path: "/journal" },
    { name: "Strategy", path: "/strategies" },
    { name: "Feed", path: "/feed" },
    { name: "Profile", path: getProfileUrl() },
  ];

  return navigationItems;
}
