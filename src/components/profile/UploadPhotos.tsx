
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UploadPhotosProps {
  avatarImage: string | null;
  onSave?: (avatarImage: string) => void;
}

function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export const UploadPhotos: React.FC<UploadPhotosProps> = ({ avatarImage, onSave }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(avatarImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast({
          description: "Only image files are allowed",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          description: "File is too large, maximum size is 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      try {
        const base64 = await getBase64(file);
        setPreview(base64);
      } catch (error) {
        console.error('Error processing image:', error);
        toast({
          description: "Error processing the image",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // In a real app, you would upload to a server here
      const base64 = await getBase64(selectedFile);
      
      // For now, just simulate an upload and call the onSave callback
      setTimeout(() => {
        if (onSave) {
          onSave(base64);
        }
        
        setIsUploading(false);
        toast({
          description: "Profile picture uploaded successfully!",
        });
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);
    } catch (error) {
      console.error('Error uploading:', error);
      setIsUploading(false);
      toast({
        description: "Error uploading the image",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-32 w-32">
        <AvatarImage src={preview || undefined} />
        <AvatarFallback>
          <Upload className="h-8 w-8 text-gray-400" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-1" />
          Select Image
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept="image/*"
          />
        </Button>
        
        {preview && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClear}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      {selectedFile && (
        <Button 
          onClick={handleUpload} 
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload Profile Picture"}
        </Button>
      )}
    </div>
  );
};
