
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Coins } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileTabProps {
  userId: string;
  displayName: string;
  avatar: string | null;
  coins: number;
  userType: "teacher" | "student";
  setDisplayName: (name: string) => void;
  setAvatar: (avatar: string | null) => void;
  onClose: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  userId,
  displayName,
  avatar,
  coins,
  userType,
  setDisplayName,
  setAvatar,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
    
    // Also update in Supabase if possible
    if (userId && userId.startsWith('admin-')) {
      // For admin users, we don't update in Supabase
      return;
    }
    
    try {
      if (userType === 'teacher') {
        supabase
          .from('teachers')
          .update({ display_name: e.target.value })
          .eq('id', userId)
          .then(({ error }) => {
            if (error) console.error("Failed to update teacher display name in DB:", error);
          });
      } else {
        supabase
          .from('students')
          .update({ display_name: e.target.value })
          .eq('id', userId)
          .then(({ error }) => {
            if (error) console.error("Failed to update student display name in DB:", error);
          });
      }
    } catch (error) {
      console.error("Error updating display name:", error);
    }
  };

  const handleViewFullProfile = () => {
    onClose(); // Close the modal
    
    if (userType === "teacher") {
      navigate(`/teacher-profile/${userId}`);
    } else {
      navigate(`/student/profile/${userId}`);
    }
  };
  
  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col items-center space-y-4">
        <UserAvatar avatar={avatar} displayName={displayName} setAvatar={setAvatar} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">{t("display-name")}</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={handleDisplayNameChange}
          placeholder="Enter your display name"
        />
      </div>
      
      {/* Show coins for students */}
      {userType === "student" && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-md border border-amber-200">
          <Coins className="h-5 w-5 text-amber-500" />
          <div>
            <p className="font-medium">{t("current-coins")}</p>
            <p className="text-2xl font-bold text-amber-600">{coins}</p>
          </div>
        </div>
      )}

      <Button 
        className="w-full mt-4" 
        variant="outline" 
        onClick={handleViewFullProfile}
      >
        {t("view-full-profile")}
      </Button>
    </div>
  );
};

export default ProfileTab;
