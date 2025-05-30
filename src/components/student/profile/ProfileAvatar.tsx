
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ProfileAvatarProps {
  avatar?: string;
  displayName: string;
  isOwnProfile: boolean;
  onAvatarChange: (imageDataUrl: string) => void;
  onViewProfile: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatar,
  displayName,
  isOwnProfile,
  onAvatarChange,
  onViewProfile
}) => {
  const { t } = useTranslation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        onAvatarChange(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="text-center">
      <div className="relative inline-block">
        <Avatar className="w-20 h-20 mx-auto">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-lg">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {isOwnProfile && (
          <div className="absolute bottom-0 right-0">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload">
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 rounded-full p-0"
                asChild
              >
                <span>
                  <Camera className="h-4 w-4" />
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;
