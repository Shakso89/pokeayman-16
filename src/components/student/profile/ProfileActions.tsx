
import React from "react";
import { Button } from "@/components/ui/button";
import { Coins, MessageSquare, UserPlus, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ProfileActionsProps {
  isOwnProfile: boolean;
  isTeacherView: boolean;
  onGiveCoins?: () => void;
  onSendMessage?: () => void;
  onViewProfile?: () => void;
  onOpenSettings?: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  isOwnProfile,
  isTeacherView,
  onGiveCoins,
  onSendMessage,
  onViewProfile,
  onOpenSettings
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      {isTeacherView && (
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
            onClick={onViewProfile}
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
