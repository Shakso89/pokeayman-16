
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Camera } from "lucide-react";
import { toast } from "sonner";

interface PhotosTabProps {
  photos: string[];
  onPhotoClick: (photoUrl: string) => void;
  onSavePhotos: (photos: string[]) => void;
  maxPhotos?: number;
  readOnly?: boolean;
}

export const PhotosTab: React.FC<PhotosTabProps> = ({
  photos,
  onPhotoClick,
  onSavePhotos,
  maxPhotos = 4,
  readOnly = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>(photos);
  
  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast.error("Only images are allowed");
        return;
      }
      
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("Image is too large (max 5MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updatedPhotos = [...currentPhotos, base64];
        setCurrentPhotos(updatedPhotos);
        onSavePhotos(updatedPhotos);
      };
      
      reader.readAsDataURL(file);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...currentPhotos];
    updatedPhotos.splice(index, 1);
    setCurrentPhotos(updatedPhotos);
    onSavePhotos(updatedPhotos);
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {currentPhotos.map((photo, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-md overflow-hidden border shadow group"
          >
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`} 
              className="w-full h-full object-cover cursor-pointer" 
              onClick={() => onPhotoClick(photo)}
            />
            
            {!readOnly && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                onClick={() => handleRemovePhoto(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {!readOnly && currentPhotos.length < maxPhotos && (
          <div 
            className="flex items-center justify-center border-2 border-dashed rounded-md aspect-square cursor-pointer hover:bg-gray-50"
            onClick={handleAddPhotoClick}
          >
            <div className="flex flex-col items-center p-4">
              <Plus className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">
                Add Photo
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Upload instructions if no photos */}
      {!readOnly && currentPhotos.length === 0 && (
        <div className="text-center py-8">
          <Camera className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">No photos yet</p>
          <p className="text-sm text-gray-400">Add up to {maxPhotos} photos</p>
          <Button 
            variant="outline" 
            onClick={handleAddPhotoClick} 
            className="mt-4"
          >
            Add Photo
          </Button>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        accept="image/*" 
      />
    </div>
  );
};
