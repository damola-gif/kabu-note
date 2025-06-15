
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormData {
  fullName: string;
  username: string;
  timezone: string;
}

export function useProfileData() {
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    username: "",
    timezone: "UTC"
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
          toast.error('Failed to load profile data');
          return;
        }

        if (profile) {
          setFormData({
            fullName: profile.full_name || "",
            username: profile.username || "",
            timezone: "UTC" // Add timezone to profiles table if needed
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    if (!formData.fullName.trim() || !formData.username.trim()) {
      toast.error('Full name and username are required');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName.trim(),
          username: formData.username.trim(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Username already taken. Please choose a different one.');
        } else {
          throw error;
        }
        return;
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    formData,
    setFormData,
    isLoading,
    isLoadingProfile,
    handleSave
  };
}
