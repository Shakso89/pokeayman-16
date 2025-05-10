
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Users, Sword, UserPlus, Shield, School, MessageSquare, BarChart, ChevronLeft } from "lucide-react";
import ClassManagement from "@/components/teacher/ClassManagement";
import BattleMode from "@/components/teacher/BattleMode";
import SchoolCollaboration from "@/components/teacher/SchoolCollaboration";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"main" | "classes" | "battle" | "collaboration">("main");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentData, setStudentData] = useState({
    username: "",
    password: "",
    displayName: "",
  });
  const [teacherData, setTeacherData] = useState<any>(null);
  const { t } = useTranslation();
  
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const teacherId = localStorage.getItem("teacherId");
  const username = localStorage.getItem("teacherUsername") || "";
  const isAdmin = username === "Admin";

  useEffect(() => {
    // Load teacher data
    if (teacherId) {
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacher = teachers.find((t: any) => t.id === teacherId);
      if (teacher) {
        setTeacherData(teacher);
      }
    }
  }, [teacherId]);

  const handleAddStudent = () => {
    // Validate student data
    if (!studentData.username || !studentData.password || !studentData.displayName) {
      toast({
        title: t("error"),
        description: t("fill-all-fields"),
        variant: "destructive",
      });
      return;
    }
    
    // Create student ID
    const studentId = "student-" + Date.now().toString();
    
    // Get all students
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    
    // Check if username is already taken
    if (students.some((s: any) => s.username === studentData.username)) {
      toast({
        title: t("error"),
        description: "This username is already in use",
        variant: "destructive",
      });
      return;
    }
    
    // Create new student
    const newStudent = {
      id: studentId,
      username: studentData.username,
      password: studentData.password,
      displayName: studentData.displayName,
      teacherId: teacherId,
      createdAt: new Date().toISOString(),
      pokemon: []
    };
    
    // Add to students array
    students.push(newStudent);
    localStorage.setItem("students", JSON.stringify(students));
    
    // Add student to teacher's student list
    if (teacherData) {
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacherIndex = teachers.findIndex((t: any) => t.id === teacherId);
      
      if (teacherIndex !== -1) {
        if (!teachers[teacherIndex].students) {
          teachers[teacherIndex].students = [];
        }
        
        teachers[teacherIndex].students.push(studentId);
        localStorage.setItem("teachers", JSON.stringify(teachers));
        
        // Update local teacher data
        setTeacherData({
          ...teacherData,
          students: [...(teacherData.students || []), studentId]
        });
      }
    }
    
    // Show success message
    toast({
      title: t("success"),
      description: t("student-added"),
    });
    
    // Reset form and close dialog
    setStudentData({
      username: "",
      password: "",
      displayName: "",
    });
    setIsAddStudentOpen(false);
  };

  if (!isLoggedIn || userType !== "teacher") {
    return <Navigate to="/teacher-login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType="teacher" 
        userName={teacherData?.displayName || username || "Teacher"} 
        userAvatar={teacherData?.avatar}
      />
      
      <div className="container mx-auto py-8 px-4">
        {currentView === "main" ? (
          <>
            <Card className="mb-6 border-none shadow-lg pokemon-gradient-bg text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{t("welcome-teacher")}</h2>
                    <p>{t("manage-classes-description")}</p>
                  </div>
                  {isAdmin && (
                    <Button 
                      onClick={() => navigate("/admin-dashboard")}
                      className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      {t("admin-dashboard")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Button 
              className="mb-6 bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
              onClick={() => setIsAddStudentOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              {t("create-student")}
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-6 w-6 text-blue-500" />
                    {t("manage-classes")}
                  </CardTitle>
                  <CardDescription>
                    {t("manage-classes-desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    {t("manage-classes-details")}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button" 
                    onClick={() => setCurrentView("classes")}
                  >
                    {t("manage-classes")}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sword className="h-6 w-6 text-red-500" />
                    {t("battle-mode")}
                  </CardTitle>
                  <CardDescription>
                    {t("battle-mode-desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    {t("battle-mode-details")}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button"
                    onClick={() => setCurrentView("battle")}
                  >
                    {t("enter-battle-mode")}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-green-500" />
                    {t("messages")}
                  </CardTitle>
                  <CardDescription>
                    {t("school-collab-desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    {t("school-collab-details")}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button"
                    onClick={() => navigate("/teacher/messages")}
                  >
                    {t("messages")}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-6 w-6 text-purple-500" />
                    {t("reports-analytics")}
                  </CardTitle>
                  <CardDescription>
                    {t("student-participation")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    {t("student-engagement")}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button"
                    onClick={() => navigate("/teacher/reports")}
                  >
                    {t("reports-analytics")}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        ) : currentView === "classes" ? (
          <ClassManagement onBack={() => setCurrentView("main")} />
        ) : currentView === "battle" ? (
          <BattleMode onBack={() => setCurrentView("main")} />
        ) : (
          <div>
            <div className="flex items-center mb-6">
              <Button variant="outline" onClick={() => setCurrentView("main")} className="mr-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("back-to-dashboard")}
              </Button>
              <h2 className="text-2xl font-bold">{t("school-collaboration")}</h2>
            </div>
            
            <SchoolCollaboration 
              teacherId={teacherId || ""} 
              teacherName={teacherData?.displayName || username || "Teacher"} 
            />
          </div>
        )}
      </div>
      
      {/* Add Student Dialog */}
      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("create-student")}</DialogTitle>
            <DialogDescription>
              {t("create-student-desc")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="studentUsername">{t("username")}</Label>
              <Input
                id="studentUsername"
                value={studentData.username}
                onChange={(e) => setStudentData({...studentData, username: e.target.value})}
                placeholder={t("student-username")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentDisplayName">{t("display-name")}</Label>
              <Input
                id="studentDisplayName"
                value={studentData.displayName}
                onChange={(e) => setStudentData({...studentData, displayName: e.target.value})}
                placeholder={t("student-display-name")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentPassword">{t("password")}</Label>
              <Input
                id="studentPassword"
                type="password"
                value={studentData.password}
                onChange={(e) => setStudentData({...studentData, password: e.target.value})}
                placeholder={t("create-password")}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAddStudent}>
              {t("create-account")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
