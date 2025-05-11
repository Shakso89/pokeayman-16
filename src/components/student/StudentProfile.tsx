
import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coins, Camera, MessageSquare, UserPlus } from "lucide-react";
import { Student } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const currentUserId = userType === "teacher" ? localStorage.getItem("teacherId") : currentStudentId;
  const isOwnProfile = currentStudentId === student.id;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    } else {
      handleViewProfile();
    }
  };
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast(t("image-too-large"));
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string;
      
      // Save to localStorage
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
          
          toast(t("avatar-updated"));
          
          // Force reload to update avatar everywhere
          window.location.reload();
        }
      } catch (error) {
        console.error("Error updating avatar:", error);
        toast(t("error-updating-avatar"));
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleViewProfile = () => {
    navigate(`/teacher/student/${student.id}`);
  };

  const handleSendMessage = () => {
    // Navigate to messages page with this student selected
    navigate(userType === "teacher" ? "/teacher/messages" : "/student/messages");
    
    // Store the selected contact in localStorage for the messages page to use
    localStorage.setItem("selectedContactId", student.id);
    localStorage.setItem("selectedContactType", "student");
  };
  
  return (
    <Card className="col-span-1 pokemon-card">
      <CardHeader>
        <CardTitle>{t("student-profile")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {/* Profile avatar with edit icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer"
                onClick={handleAvatarClick}
              >
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
              
              {isOwnProfile && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={16} />
                </Button>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">{t("display-name")}:</p>
            <p className="cursor-pointer" onClick={handleViewProfile}>{student.displayName}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">{t("username")}:</p>
            <p>{student.username}</p>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{t("current-coins")}:</p>
              <p>{coins}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t("spent-coins")}:</p>
              <p>{spentCoins}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t("pokemon-count")}:</p>
            <p>{pokemonCount}</p>
          </div>
          {schoolRanking && (
            <div>
              <p className="text-sm font-medium text-gray-500">{t("school-ranking")}:</p>
              <p>#{schoolRanking}</p>
            </div>
          )}
          
          <Separator className="my-2" />
          
          {userType === "teacher" && (
            <div className="flex flex-col gap-2">
              <Button className="w-full flex items-center" onClick={onGiveCoins}>
                <Coins className="h-4 w-4 mr-2" />
                {t("give-coins")}
              </Button>
            </div>
          )}
          
          {!isOwnProfile && (
            <div className="flex flex-col gap-2">
              <Button 
                variant="secondary" 
                className="w-full flex items-center" 
                onClick={handleSendMessage}
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfile;
