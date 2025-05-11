
import React from "react";
import { useParams } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { ProfileHeader } from "@/components/student-profile/ProfileHeader";
import { ProfileSidebar } from "@/components/student-profile/ProfileSidebar";
import { ProfileTabs } from "@/components/student-profile/ProfileTabs";
import { StudentCoinInfo } from "@/components/student-profile/StudentCoinInfo";

export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  
  const {
    student,
    isLoading,
    isEditing,
    editData,
    isOwner,
    friendRequestSent,
    setEditData,
    setIsEditing,
    handleSave,
    handleCancel,
    handleSendMessage,
    handleAddFriend
  } = useStudentProfile(studentId);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Student not found</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavBar 
        userType={localStorage.getItem("userType") as "teacher" | "student"}
        userName={localStorage.getItem("studentName") || localStorage.getItem("teacherUsername") || ""}
      />
      
      <div className="container mx-auto py-8 px-4 flex-grow">
        <ProfileHeader title="Student Profile" />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="col-span-1">
            <ProfileSidebar
              student={student}
              isOwner={isOwner}
              isEditing={isEditing}
              friendRequestSent={friendRequestSent}
              onEditClick={() => setIsEditing(true)}
              onSendMessageClick={handleSendMessage}
              onAddFriendClick={handleAddFriend}
              onSaveClick={handleSave}
              onCancelClick={handleCancel}
            />
            
            {/* Student Coin Information */}
            {student.id && <StudentCoinInfo studentId={student.id} />}
          </div>
          
          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3">
            <ProfileTabs 
              student={student}
              isEditing={isEditing}
              editData={editData}
              onEditDataChange={setEditData}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
