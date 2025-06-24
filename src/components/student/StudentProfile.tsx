
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
  achievement?: "star_of_class" | "top_of_school" | null;
  onGiveCoins: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  coins,
  spentCoins,
  pokemonCount,
  battlesCount,
  schoolRanking,
  achievement,
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
        
        if (isOwnProfile) {
          localStorage.setItem("studentAvatar", imageDataUrl);
        }
        
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  const handleSendMessage = () => {
    navigate(userType === "teacher" ? "/teacher/messages" : "/student/messages");
    localStorage.setItem("selectedContactId", student.id);
    localStorage.setItem("selectedContactType", "student");
  };

  const handleViewProfile = () => {
    if (userType === "teacher") {
      navigate(`/student/${student.id}`);
    } else {
      navigate(`/student-profile/${student.id}`);
    }
  };
  
  const handleOpenSettings = () => {
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
            achievement={achievement}
            onAvatarChange={handleAvatarChange}
            onViewProfile={handleViewProfile}
          />
          
          <ProfileInfo
            displayName={student.displayName}
            username={student.username}
            teacherName={teacherName}
            schoolName={schoolName}
          />
          
          <CoinsDisplay
            studentId={student.id}
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
            studentName={student.displayName}
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
