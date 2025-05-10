
import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { User, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AvatarSelectorProps {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ avatarUrl, setAvatarUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Default avatars (Pokemon)
  const defaultAvatars = [
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", // Pikachu
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", // Bulbasaur
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png", // Charmander
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png", // Squirtle
  ];
  
  const handleSelectAvatar = (avatar: string) => {
    setAvatarUrl(avatar);
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simple file validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Create a URL for the selected file
    const fileUrl = URL.createObjectURL(file);
    setAvatarUrl(fileUrl);
  };
  
  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="mb-2 text-center">
        <Label>Choose an Avatar</Label>
      </div>
      <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          <User className="h-12 w-12 text-gray-400" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {defaultAvatars.map((avatar, index) => (
          <button
            key={index}
            type="button"
            className={`rounded-full p-1 ${
              avatarUrl === avatar ? 'ring-2 ring-primary' : 'hover:bg-gray-100'
            }`}
            onClick={() => handleSelectAvatar(avatar)}
          >
            <img src={avatar} alt={`Avatar ${index}`} className="w-10 h-10 rounded-full" />
          </button>
        ))}
        
        <button
          type="button"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
          onClick={handleUploadClick}
        >
          <Upload className="h-5 w-5 text-gray-600" />
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </button>
      </div>
    </div>
  );
};

export default AvatarSelector;
