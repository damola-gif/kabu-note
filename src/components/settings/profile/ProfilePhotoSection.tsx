
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProfilePhotoSectionProps {
  fullName: string;
  userEmail?: string;
}

export function ProfilePhotoSection({ fullName, userEmail }: ProfilePhotoSectionProps) {
  const handlePhotoChange = () => {
    toast.info("Photo upload feature coming soon!");
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src="" alt="Profile" />
        <AvatarFallback className="text-lg bg-[#2AB7CA]/10 text-[#2AB7CA]">
          {fullName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Button onClick={handlePhotoChange} variant="outline">
          Change Photo
        </Button>
        <p className="text-xs text-gray-500 mt-1 break-words">
          JPG, PNG or GIF. Max size 2MB.
        </p>
      </div>
    </div>
  );
}
