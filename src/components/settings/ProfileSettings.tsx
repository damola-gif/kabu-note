
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
