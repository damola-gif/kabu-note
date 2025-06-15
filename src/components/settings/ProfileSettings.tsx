
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/contexts/SessionProvider";
import { toast } from "sonner";

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Africa/Lagos", label: "Lagos (WAT)" },
];

export function ProfileSettings() {
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    timezone: "UTC"
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement profile update logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = () => {
    // TODO: Implement photo upload
    toast.info("Photo upload coming soon!");
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="" alt="Profile" />
          <AvatarFallback className="text-lg bg-[#2AB7CA]/10 text-[#2AB7CA]">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
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

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            value={user?.email || ""}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500 break-words">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Choose a username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Preferred Timezone</Label>
          <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-[#2AB7CA] hover:bg-[#2AB7CA]/90"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
