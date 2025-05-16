
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare } from "lucide-react";
import Footer from "@/components/Footer";
import { ProfileSidebar } from "@/components/student-profile/ProfileSidebar";
import { ProfileTabs } from "@/components/teacher-profile/ProfileTabs";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";

export default function TeacherProfilePage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  
  const {
    teacher,
    isLoading,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    isOwner,
    studentCount,
    friendRequestSent,
    handleSave,
    handleCancel,
    handleAddFriend,
    updateSocialLink
  } = useTeacherProfile(teacherId);
  
  const handleSendMessage = () => {
    if (!teacher) return;
    
    // Store the selected contact in localStorage
    localStorage.setItem("selectedContactId", teacher.id);
    localStorage.setItem("selectedContactType", "teacher");
    
    // Navigate to messages page
    navigate("/teacher/messages");
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Teacher not found</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavBar 
        userType={"teacher"}
        userName={localStorage.getItem("teacherDisplayName") || ""}
      />
      
      <div className="container mx-auto py-8 px-4 flex-grow">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            className="mr-4"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Teacher Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <ProfileSidebar
            student={{
              id: teacher.id,
              displayName: teacher.displayName,
              username: teacher.username,
              avatar: teacher.avatar
            }}
            isOwner={isOwner}
            isEditing={isEditing}
            friendRequestSent={friendRequestSent}
            onEditClick={() => setIsEditing(true)}
            onSendMessageClick={handleSendMessage}
            onAddFriendClick={handleAddFriend}
            onSaveClick={handleSave}
            onCancelClick={handleCancel}
          />
          
          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3">
            <ProfileTabs 
              teacher={teacher}
              isEditing={isEditing}
              isOwner={isOwner}
              studentCount={studentCount}
              editData={editData}
              setEditData={setEditData}
              updateSocialLink={updateSocialLink}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
