
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  title: string;
  onBack?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ title, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Improved back navigation
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // Fallback based on user type
        const userType = localStorage.getItem("userType");
        if (userType === "teacher") {
          navigate('/teacher-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      }
    }
  };

  return (
    <div className="flex items-center mb-6">
      <Button 
        variant="outline" 
        className="mr-4"
        onClick={handleBack}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
};
