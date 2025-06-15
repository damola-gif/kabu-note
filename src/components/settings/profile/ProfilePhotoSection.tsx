
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

  const uploadMedia = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('post-media')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('post-media')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      toast.error('Please select a file and ensure you are logged in');
      return;
    }

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

    console.log('Starting profile photo upload for user:', user.id);
    setIsUploading(true);
    try {
      // Upload using the same method as feed posts
      const publicUrl = await uploadMedia(file);
      console.log('Upload successful, public URL:', publicUrl);

      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully');
      toast.success('Profile photo updated successfully!');
      onAvatarUpdate?.(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
