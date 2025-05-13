
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface UserAvatarProps {
  avatar: string | null;
  displayName: string;
  setAvatar: (avatar: string | null) => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatar, displayName, setAvatar }) => {
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatar || undefined} />
        <AvatarFallback>
          {displayName?.substring(0, 2).toUpperCase() || "NA"}
        </AvatarFallback>
      </Avatar>
      <label
        htmlFor="avatar-upload"
        className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer"
      >
        <Camera className="h-4 w-4" />
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </label>
    </div>
  );
};

export default UserAvatar;
