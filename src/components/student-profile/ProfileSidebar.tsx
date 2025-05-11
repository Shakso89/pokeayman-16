
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, MessageSquare, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileSidebarProps {
  student: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string;
  };
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
  onCancelClick
}) => {
  return (
    <Card className="col-span-1">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
              {student.avatar ? (
                <img 
                  src={student.avatar} 
                  alt={student.displayName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">
                    {student.displayName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <CardTitle>{student.displayName}</CardTitle>
        <p className="text-sm text-gray-500">@{student.username}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {!isOwner && (
            <div className="mt-4">
              <Button 
                className="w-full mb-2"
                onClick={onSendMessageClick}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onAddFriendClick}
                disabled={friendRequestSent}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {friendRequestSent ? "Friend Request Sent" : "Add Friend"}
              </Button>
            </div>
          )}
          
          {isOwner && !isEditing && (
            <Button 
              className="mt-4 w-full"
              onClick={onEditClick}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
          
          {isOwner && isEditing && (
            <div className="flex gap-2 mt-4">
              <Button 
                className="flex-1"
                onClick={onSaveClick}
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onCancelClick}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
