
import React from "react";
import { Button } from "@/components/ui/button";
import { Coins, MessageSquare, UserPlus, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";

interface ProfileActionsProps {
  isOwnProfile: boolean;
  isTeacherView: boolean;
  studentId?: string;
  onGiveCoins?: () => void;
  onSendMessage?: () => void;
  onOpenSettings?: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  isOwnProfile,
  isTeacherView,
  studentId,
  onGiveCoins,
  onSendMessage,
  onOpenSettings
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (studentId) {
      // Navigate to the correct student detail route
      navigate(`/student-detail/${studentId}`);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {isTeacherView && onGiveCoins && (
        <Button className="w-full flex items-center" onClick={onGiveCoins}>
          <Coins className="h-4 w-4 mr-2" />
          {t("give-coins")}
        </Button>
      )}
      
      {!isOwnProfile && (
        <>
          <Button 
            variant="secondary" 
            className="w-full flex items-center" 
            onClick={onSendMessage}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {t("send-message")}
          </Button>
          <Button 
            variant="outline" 
            className="w-full flex items-center"
            onClick={handleViewProfile}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t("view-profile")}
          </Button>
        </>
      )}
      
      {isOwnProfile && (
        <Button
          variant="outline"
          className="w-full flex items-center"
          onClick={onOpenSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          {t("settings")}
        </Button>
      )}
    </div>
  );
};

export default ProfileActions;
