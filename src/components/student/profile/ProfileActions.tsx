
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, MessageCircle, UserPlus } from "lucide-react";

interface ProfileActionsProps {
  isOwnProfile: boolean;
  isTeacherView?: boolean;
  studentId: string;
  studentName?: string;
  onGiveCoins?: () => void;
  onSendMessage?: () => void;
  onOpenSettings?: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  isOwnProfile,
  isTeacherView = false,
  studentId,
  studentName,
  onGiveCoins,
  onSendMessage,
  onOpenSettings
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    console.log("Navigating to profile for student:", studentId);
    navigate(`/student-profile/${studentId}`);
  };

  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage();
    } else if (studentName) {
      navigate("/student/messages", {
        state: { recipientId: studentId, recipientName: studentName }
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleViewProfile}
        variant="outline" 
        size="sm"
        className="flex items-center gap-1"
      >
        <User className="h-4 w-4" />
        View Profile
      </Button>
      
      {!isOwnProfile && (
        <>
          <Button 
            onClick={handleSendMessage}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <UserPlus className="h-4 w-4" />
            Add Friend
          </Button>
        </>
      )}

      {isTeacherView && onGiveCoins && (
        <Button 
          onClick={onGiveCoins}
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          Give Coins
        </Button>
      )}

      {isOwnProfile && onOpenSettings && (
        <Button 
          onClick={onOpenSettings}
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          Settings
        </Button>
      )}
    </div>
  );
};

export default ProfileActions;
