
import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { NavBar } from "@/components/NavBar";
import { UploadPhotos } from "@/components/profile/UploadPhotos";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface StudentData {
  id: string;
  username: string;
  displayName: string;
  teacherId: string;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  classId?: string;
}

const StudentDetailPage: React.FC = () => {
  const { id, studentId } = useParams<{ id?: string, studentId?: string }>();
  const [student, setStudent] = useState<StudentData | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  
  // Use the ID from either parameter
  const actualStudentId = studentId || id;

  useEffect(() => {
    if (actualStudentId) {
      loadStudentData(actualStudentId);
    }
  }, [actualStudentId]);
  
  const loadStudentData = (id: string) => {
    const studentsData = localStorage.getItem("students");
    if (studentsData) {
      const students = JSON.parse(studentsData);
      const foundStudent = students.find((s: StudentData) => s.id === id);
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        toast({
          description: t("student-not-found"),
          variant: "destructive",
        });
        navigate(-1);
      }
    }
  };

  if (!isLoggedIn) {
    return <Navigate to={userType === "teacher" ? "/teacher-login" : "/student-login"} />;
  }
  
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar 
          userType={userType as "teacher" | "student"} 
          userName={userType === "teacher" ? localStorage.getItem("teacherDisplayName") || "Teacher" : localStorage.getItem("studentName") || ""}
        />
        <div className="container mx-auto py-8 px-4 text-center">
          <p>{t("loading")}...</p>
        </div>
      </div>
    );
  }

  const handleAvatarUpdate = (newAvatar: string) => {
    // Update student data in localStorage
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const studentIndex = students.findIndex((s: any) => s.id === actualStudentId);
    
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

  const isOwnProfile = userType === "student" && 
    localStorage.getItem("studentId") === actualStudentId;
  const canEdit = userType === "teacher" || isOwnProfile;

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType={userType as "teacher" | "student"}
        userName={userType === "teacher" ? 
          localStorage.getItem("teacherDisplayName") || "Teacher" : 
          localStorage.getItem("studentName") || ""}
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <h1 className="text-2xl font-bold">{t("student-profile")}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student Profile Card */}
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
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("class")}:</p>
                  <p>{student.classId || t("no-class-assigned")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="photos">
              <TabsList className="mb-4">
                <TabsTrigger value="photos">{t("photos")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("student-photos")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UploadPhotos 
                      avatarImage={student.avatar || null}
                      onSave={handleAvatarUpdate} 
                      readOnly={!canEdit}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Photo View Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="p-4">
            <DialogTitle>{t("photo")}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex items-center justify-center p-2">
              <img 
                src={selectedPhoto} 
                alt="Enlarged" 
                className="max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailPage;
