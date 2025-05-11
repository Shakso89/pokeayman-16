
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  title: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center mb-6">
      <Button 
        variant="outline" 
        className="mr-4"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
};
