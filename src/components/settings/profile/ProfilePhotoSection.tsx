
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionProvider";

interface ProfilePhotoSectionProps {
  fullName: string;
  userEmail?: string;
  avatarUrl?: string;
  onAvatarUpdate?: (url: string) => void;
}

export function ProfilePhotoSection({ fullName, userEmail, avatarUrl, onAvatarUpdate }: ProfilePhotoSectionProps) {
  const { user } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Profile photo updated successfully!');
      onAvatarUpdate?.(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatarUrl || ''} alt="Profile" />
        <AvatarFallback className="text-lg bg-primary/10 text-primary">
          {fullName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Button 
          onClick={handlePhotoChange} 
          variant="outline" 
          className="btn-landing-ghost"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Change Photo'}
        </Button>
        <p className="text-xs text-muted-foreground mt-1 break-words">
          JPG, PNG or GIF. Max size 2MB.
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
</AvatarImage>

Now I'll update the ProfileSettings component to pass the avatar URL and handle updates:

<lov-write file_path="src/components/settings/ProfileSettings.tsx">
import { ProfilePhotoSection } from "./profile/ProfilePhotoSection";
import { ProfileFormFields } from "./profile/ProfileFormFields";
import { ProfileActions } from "./profile/ProfileActions";
import { useProfileData } from "./profile/useProfileData";

export function ProfileSettings() {
  const {
    user,
    formData,
    setFormData,
    isLoading,
    isLoadingProfile,
    handleSave,
    avatarUrl,
    setAvatarUrl
  } = useProfileData();

  if (isLoadingProfile) {
    return <div className="flex justify-center py-8">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <ProfilePhotoSection 
        fullName={formData.fullName}
        userEmail={user?.email}
        avatarUrl={avatarUrl}
        onAvatarUpdate={setAvatarUrl}
      />

      <ProfileFormFields 
        formData={formData}
        setFormData={setFormData}
        userEmail={user?.email}
      />

      <ProfileActions 
        formData={formData}
        isLoading={isLoading}
        onSave={handleSave}
      />
    </div>
  );
}
