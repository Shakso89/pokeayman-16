
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PhotoGrid } from "@/components/profile/PhotoGrid";
import { TeacherProfileData } from "@/hooks/useTeacherProfile";

interface ProfilePhotosTabProps {
  photos: string[];
  isEditing: boolean;
  isOwner: boolean;
  onPhotosChange: (photos: string[]) => void;
}

export const ProfilePhotosTab: React.FC<ProfilePhotosTabProps> = ({
  photos,
  isEditing,
  isOwner,
  onPhotosChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <p className="text-sm text-gray-500">Upload up to 4 photos</p>
      </CardHeader>
      <CardContent>
        <PhotoGrid 
          photos={photos || []}
          maxPhotos={4}
          editable={isOwner && isEditing}
          onPhotosChange={onPhotosChange}
        />
      </CardContent>
    </Card>
  );
};
