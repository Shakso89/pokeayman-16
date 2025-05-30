
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Student } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { getSchoolName, getTeacherName } from "@/components/teacher/dashboard/student/studentService";
import ProfileAvatar from "./profile/ProfileAvatar";
import ProfileInfo from "./profile/ProfileInfo";
import CoinsDisplay from "./profile/CoinsDisplay";
import ProfileStats from "./profile/ProfileStats";
import ProfileActions from "./profile/ProfileActions";

interface StudentProfileProps {
  student: Student;
  coins: number;
  spentCoins: number;
  pokemonCount: number;
  battlesCount: number;
  schoolRanking: number | null;
  onGiveCoins: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  coins,
  spentCoins,
  pokemonCount,
  battlesCount,
  schoolRanking,
  onGiveCoins,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  const currentStudentId = localStorage.getItem("studentId");
  const isOwnProfile = currentStudentId === student.id;
  
  const [schoolName, setSchoolName] = useState<string>("Loading...");
  const [teacherName, setTeacherName] = useState<string>("Loading...");
  
  useEffect(() => {
    // Fetch school and teacher information
    if (student.schoolId) {
      getSchoolName(student.schoolId).then(setSchoolName);
    }
    
    if (student.teacherId) {
      getTeacherName(student.teacherId).then(setTeacherName);
    }
  }, [student.schoolId, student.teacherId]);
  
  const handleAvatarChange = (imageDataUrl: string) => {
    try {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const studentIndex = students.findIndex((s: Student) => s.id === student.id);
      
      if (studentIndex !== -1) {
        students[studentIndex].avatar = imageDataUrl;
        localStorage.setItem("students", JSON.stringify(students));
        
        // Update page without reload
        if (isOwnProfile) {
          localStorage.setItem("studentAvatar", imageDataUrl);
        }
        
        // Force reload to update avatar everywhere
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  const handleSendMessage = () => {
    // Navigate to messages page with this student selected
    navigate(userType === "teacher" ? "/teacher/messages" : "/student/messages");
    
    // Store the selected contact in localStorage for the messages page to use
    localStorage.setItem("selectedContactId", student.id);
    localStorage.setItem("selectedContactType", "student");
  };
  
  const handleOpenSettings = () => {
    // For demonstration purposes, we'll just show a toast
    // In a real implementation, this would open a settings modal
    import("sonner").then(({ toast }) => {
      toast("Settings would open here");
    });
  };
  
  return (
    <Card className="col-span-1 pokemon-card">
      <CardHeader>
        <CardTitle>{t("student-profile")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <ProfileAvatar
            avatar={student.avatar}
            displayName={student.displayName}
            isOwnProfile={isOwnProfile}
            onAvatarChange={handleAvatarChange}
            onViewProfile={() => {}} // Remove since it's handled in ProfileActions now
          />
          
          <ProfileInfo
            displayName={student.displayName}
            username={student.username}
            teacherName={teacherName}
            schoolName={schoolName}
          />
          
          <CoinsDisplay
            coins={coins}
            spentCoins={spentCoins}
          />
          
          <ProfileStats
            pokemonCount={pokemonCount}
            schoolRanking={schoolRanking}
            battlesCount={battlesCount}
          />
          
          <Separator className="my-2" />
          
          <ProfileActions
            isOwnProfile={isOwnProfile}
            isTeacherView={userType === "teacher"}
            studentId={student.id}
            onGiveCoins={onGiveCoins}
            onSendMessage={handleSendMessage}
            onOpenSettings={handleOpenSettings}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfile;
