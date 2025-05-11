import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { NavBar } from "@/components/NavBar";
import { UploadPhotos } from "@/components/profile/UploadPhotos";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Save, XCircle } from "lucide-react";

interface StudentData {
  id: string;
  username: string;
  displayName: string;
  teacherId: string;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
}

interface ProfileFormData {
  displayName: string;
  username: string;
}

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    if (id) {
      const studentsData = localStorage.getItem("students");
      if (studentsData) {
        const students = JSON.parse(studentsData);
        const foundStudent = students.find((s: StudentData) => s.id === id);
        setStudent(foundStudent);
      }
    }
  }, [id]);

  if (!isLoggedIn || userType !== "teacher" || !student) {
    return <Navigate to="/teacher-login" />;
  }

  const handleUpdateProfile = async (values: ProfileFormData) => {
    setIsUpdating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Update student data in localStorage
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const studentIndex = students.findIndex((s: any) => s.id === id);
      
      if (studentIndex !== -1) {
        students[studentIndex] = {
          ...students[studentIndex],
          ...values,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem("students", JSON.stringify(students));
        
        // Update component state
        setStudent({
          ...student!,
          ...values
        });
        
        toast({
          description: "Profile updated successfully!",
        });
      } else {
        toast({
          description: "Student not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowEditForm(false);
    }
  };

  const handleAvatarUpdate = (newAvatar: string) => {
    // Update student data in localStorage
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const studentIndex = students.findIndex((s: any) => s.id === id);
    
    if (studentIndex !== -1) {
      students[studentIndex].avatar = newAvatar;
      localStorage.setItem("students", JSON.stringify(students));
      
      // Update component state
      setStudent({
        ...student!,
        avatar: newAvatar
      });
      
      toast({
        description: "Avatar updated successfully!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="teacher" userName="Teacher" />
      
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6 border-none shadow-lg pokemon-gradient-bg text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2">{student.displayName}</h2>
                <p>{t("student-profile")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {t("profile-information")}
              {!showEditForm ? (
                <Button size="sm" onClick={() => setShowEditForm(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t("edit-profile")}
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setShowEditForm(false)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("cancel")}
                </Button>
              )}
            </CardTitle>
            <CardDescription>{t("view-edit-student-info")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex justify-center">
              <UploadPhotos avatarImage={student.avatar || null} onSave={handleAvatarUpdate} />
            </div>
            
            {showEditForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">{t("display-name")}</Label>
                  <Input
                    id="displayName"
                    defaultValue={student.displayName}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label htmlFor="username">{t("username")}</Label>
                  <Input
                    id="username"
                    defaultValue={student.username}
                    disabled={isUpdating}
                  />
                </div>
                <Button onClick={() => handleUpdateProfile({
                      displayName: (document.getElementById("displayName") as HTMLInputElement).value,
                      username: (document.getElementById("username") as HTMLInputElement).value
                    })} disabled={isUpdating} className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? t("updating") : t("save-changes")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t("display-name")}</Label>
                  <Input value={student.displayName} readOnly />
                </div>
                <div>
                  <Label>{t("username")}</Label>
                  <Input value={student.username} readOnly />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDetailPage;
