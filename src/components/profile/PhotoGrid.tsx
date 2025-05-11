
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, X } from 'lucide-react';
import { toast } from "sonner";

interface PhotoGridProps {
  photos: string[];
  maxPhotos: number;
  editable: boolean;
  onPhotosChange: (photos: string[]) => void;
}

export function PhotoGrid({ photos, maxPhotos, editable, onPhotosChange }: PhotoGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAddClick = () => {
    if (photos.length >= maxPhotos) {
      toast.error(`Maximum of ${maxPhotos} photos allowed`);
      return;
    }
    
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Only image files are allowed");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onPhotosChange([...photos, e.target.result.toString()]);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
  };
  
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
            <img 
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {editable && (
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-md"
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
            )}
          </div>
        ))}
        
        {editable && photos.length < maxPhotos && (
          <div 
            className="border border-dashed border-gray-300 rounded-md flex items-center justify-center aspect-square cursor-pointer hover:bg-gray-50"
            onClick={handleAddClick}
          >
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Plus className="h-8 w-8 mb-1" />
              <span className="text-sm">Add Photo</span>
            </div>
          </div>
        )}
      </div>
      
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {editable && (
        <p className="text-xs text-gray-500 mt-2">
          Allowed formats: JPG, PNG, GIF. Max size: 5MB.
        </p>
      )}
    </div>
  );
}
