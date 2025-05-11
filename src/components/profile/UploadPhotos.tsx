
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface UploadPhotosProps {
  userId: string;
  userType: "teacher" | "student";
  isOwnProfile: boolean;
  onPhotoClick: (url: string) => void;
}

interface UserPhotos {
  userId: string;
  userType: "teacher" | "student";
  photos: string[];
}

const MAX_PHOTOS = 4;
const MAX_SIZE_MB = 5;

const UploadPhotos: React.FC<UploadPhotosProps> = ({ 
  userId, 
  userType, 
  isOwnProfile,
  onPhotoClick
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  
  useEffect(() => {
    loadPhotos();
  }, [userId]);
  
  const loadPhotos = () => {
    try {
      const allPhotos: UserPhotos[] = JSON.parse(localStorage.getItem("userPhotos") || "[]");
      const userPhotos = allPhotos.find(p => p.userId === userId && p.userType === userType);
      
      if (userPhotos) {
        setPhotos(userPhotos.photos);
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error("Error loading photos:", error);
      setPhotos([]);
    }
  };
  
  const handlePhotoClick = () => {
    if (isOwnProfile && photos.length < MAX_PHOTOS) {
      fileInputRef.current?.click();
    }
  };
  
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      toast(t("photo-too-large", { size: MAX_SIZE_MB }));
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      // Save photo to localStorage
      try {
        const allPhotos: UserPhotos[] = JSON.parse(localStorage.getItem("userPhotos") || "[]");
        const userPhotosIndex = allPhotos.findIndex(p => p.userId === userId && p.userType === userType);
        
        if (userPhotosIndex !== -1) {
          // User already has photos
          if (allPhotos[userPhotosIndex].photos.length >= MAX_PHOTOS) {
            toast(t("max-photos-reached", { count: MAX_PHOTOS }));
            return;
          }
          
          allPhotos[userPhotosIndex].photos.push(reader.result as string);
        } else {
          // First photo for this user
          allPhotos.push({
            userId,
            userType,
            photos: [reader.result as string]
          });
        }
        
        localStorage.setItem("userPhotos", JSON.stringify(allPhotos));
        
        // Update local state
        loadPhotos();
        
        toast(t("photo-uploaded"));
      } catch (error) {
        console.error("Error saving photo:", error);
        toast(t("error-uploading-photo"));
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleDeletePhoto = (index: number) => {
    try {
      const allPhotos: UserPhotos[] = JSON.parse(localStorage.getItem("userPhotos") || "[]");
      const userPhotosIndex = allPhotos.findIndex(p => p.userId === userId && p.userType === userType);
      
      if (userPhotosIndex !== -1) {
        // Remove the photo
        allPhotos[userPhotosIndex].photos.splice(index, 1);
        
        // If no photos left, remove the entry
        if (allPhotos[userPhotosIndex].photos.length === 0) {
          allPhotos.splice(userPhotosIndex, 1);
        }
        
        localStorage.setItem("userPhotos", JSON.stringify(allPhotos));
        
        // Update local state
        loadPhotos();
        
        toast(t("photo-removed"));
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast(t("error-removing-photo"));
    }
  };
  
  const renderPhotoPlaceholders = () => {
    const placeholders = [];
    
    // Add existing photos
    photos.forEach((photo, index) => {
      placeholders.push(
        <div 
          key={`photo-${index}`}
          className="relative group aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer"
          onClick={() => onPhotoClick(photo)}
        >
          <img 
            src={photo} 
            alt={`${userType} photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
          
          {isOwnProfile && (
            <div 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePhoto(index);
              }}
            >
              <Button variant="destructive" size="icon" className="h-8 w-8">
                <X size={16} />
              </Button>
            </div>
          )}
        </div>
      );
    });
    
    // Add empty slots if needed
    if (isOwnProfile && photos.length < MAX_PHOTOS) {
      placeholders.push(
        <div 
          key="add-photo"
          className="aspect-square bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={handlePhotoClick}
        >
          <Image size={24} className="text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">{t("add-photo")}</p>
        </div>
      );
    }
    
    // Fill remaining slots with disabled placeholders if not own profile
    if (!isOwnProfile) {
      for (let i = photos.length; i < MAX_PHOTOS; i++) {
        placeholders.push(
          <div 
            key={`empty-${i}`}
            className="aspect-square bg-gray-100 rounded-md border border-gray-200"
          />
        );
      }
    }
    
    return placeholders;
  };
  
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {renderPhotoPlaceholders()}
      </div>
      
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handlePhotoChange}
      />
    </div>
  );
};

export default UploadPhotos;
