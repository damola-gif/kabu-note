
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface FormData {
  fullName: string;
  username: string;
  timezone: string;
}

interface ProfileActionsProps {
  formData: FormData;
  isLoading: boolean;
  onSave: () => void;
}

export function ProfileActions({ formData, isLoading, onSave }: ProfileActionsProps) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    const trimmedUsername =
      typeof formData.username === "string"
        ? formData.username.trim()
        : "";
    if (!trimmedUsername || trimmedUsername.length < 3 || trimmedUsername.toLowerCase() === "profile") {
      toast.error("Please save a valid username (at least 3 characters and not 'profile') in settings first.");
      return;
    }
    navigate(`/u/${trimmedUsername}`);
  };

  return (
    <div className="pt-4 flex gap-4">
      <Button 
        onClick={onSave} 
        disabled={isLoading || !formData.fullName.trim() || !formData.username.trim()}
        className="bg-[#2AB7CA] hover:bg-[#2AB7CA]/90"
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
      
      {formData.username && (
        <Button 
          onClick={handleViewProfile}
          variant="outline"
        >
          View Profile
        </Button>
      )}
    </div>
  );
}
