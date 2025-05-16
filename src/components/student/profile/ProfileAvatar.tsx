
import React, { useRef } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  onViewProfile,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast(t("image-too-large"));
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string;
      onAvatarChange(imageDataUrl);
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex justify-center mb-4">
      <div className="relative">
        <div 
          className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer"
          onClick={onViewProfile}
        >
          {avatar ? (
            <img 
              src={avatar} 
              alt={displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500">
                {displayName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        {isOwnProfile && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md"
            onClick={handleAvatarClick}
          >
            <Camera size={16} />
          </Button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleAvatarChange}
      />
    </div>
  );
};

export default ProfileAvatar;
