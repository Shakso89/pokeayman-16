import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, MessageSquare, UserPlus, Save, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import FriendRequestDialog from "@/components/dialogs/FriendRequestDialog";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

interface ProfileSidebarProps {
  student: Student;
  isOwner: boolean;
  isEditing: boolean;
  friendRequestSent: boolean;
  onEditClick: () => void;
  onSendMessageClick: () => void;
  onAddFriendClick: () => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  student,
  isOwner,
  isEditing,
  friendRequestSent,
  onEditClick,
  onSendMessageClick,
  onAddFriendClick,
  onSaveClick,
  onCancelClick,
}) => {
  const { t } = useTranslation();
  const [showFriendDialog, setShowFriendDialog] = useState(false);
  const [displayName, setDisplayName] = useState(student.displayName || student.username || "");
  
  useEffect(() => {
    // Keep displayName in sync with student data
    setDisplayName(student.displayName || student.username || "");
  }, [student.displayName, student.username]);
  
  const handleSave = async () => {
    // If there's a database connection, update the name there
    try {
      await supabase
        .from('students')
        .update({ display_name: displayName })
        .eq('id', student.id);
    } catch (err) {
      console.error("Error updating display name in database:", err);
    }
    
    // Call the parent's save function (which should handle local storage)
    onSaveClick();
  };
  
  // Safe display name for rendering
  const safeDisplayName = student.displayName || student.username || "Student";
  const avatarInitials = safeDisplayName.length >= 2 ? 
    safeDisplayName.substring(0, 2).toUpperCase() : 
    safeDisplayName.substring(0, 1).toUpperCase() || "S";
  
  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-200 mb-3">
            {student.avatar ? (
              <img 
                src={student.avatar} 
                alt={safeDisplayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400">
                {avatarInitials}
              </div>
            )}
          </div>
          
          {/* Display Name */}
          {isEditing ? (
            <Input
              className="text-center text-xl font-bold mb-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          ) : (
            <h2 className="text-xl font-bold mb-2">{safeDisplayName}</h2>
          )}
          
          {/* Username */}
          <p className="text-gray-500 text-sm mb-4">@{student.username || "unknown"}</p>
          
          {/* Actions */}
          <div className="flex flex-col w-full space-y-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="w-full flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  {t("save")}
                </Button>
                <Button variant="outline" onClick={onCancelClick} className="w-full flex items-center">
                  <X className="mr-2 h-4 w-4" />
                  {t("cancel")}
                </Button>
              </>
            ) : (
              <>
                {isOwner && (
                  <Button onClick={onEditClick} className="w-full flex items-center">
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("edit-profile")}
                  </Button>
                )}
                
                {!isOwner && (
                  <>
                    <Button 
                      onClick={onSendMessageClick} 
                      className="w-full flex items-center"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t("send-message")}
                    </Button>
                    
                    <Button 
                      variant={friendRequestSent ? "secondary" : "outline"}
                      onClick={friendRequestSent ? () => {} : onAddFriendClick} 
                      disabled={friendRequestSent}
                      className="w-full flex items-center"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {friendRequestSent ? t("request-sent") : t("add-friend")}
                    </Button>
                  </>
                )}
                
                {isOwner && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFriendDialog(true)} 
                    className="w-full flex items-center"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t("find-friends")}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Friend Request Dialog */}
      <FriendRequestDialog 
        open={showFriendDialog} 
        onOpenChange={setShowFriendDialog} 
      />
    </Card>
  );
};
