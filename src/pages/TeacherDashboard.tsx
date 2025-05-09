
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Users, Sword, UserPlus, Shield, School } from "lucide-react";
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
        title: "Missing information",
        description: "Please fill in all fields",
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
        title: "Username taken",
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
      title: "Success",
      description: "Student account created",
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
      <NavBar userType="teacher" userName={teacherData?.displayName || username || "Teacher"} />
      
      <div className="container mx-auto py-8 px-4">
        {currentView === "main" ? (
          <>
            <Card className="mb-6 border-none shadow-lg pokemon-gradient-bg text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{t("welcome-teacher") || "Welcome, Pokémon Teacher!"}</h2>
                    <p>{t("manage-classes-description") || "Manage your classes and create exciting battles for your students."}</p>
                  </div>
                  {isAdmin && (
                    <Button 
                      onClick={() => navigate("/admin-dashboard")}
                      className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      {t("admin-dashboard") || "Admin Dashboard"}
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
              {t("create-student") || "Create Student Account"}
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-500" />
                    {t("manage-classes") || "Manage Classes/Schools"}
                  </CardTitle>
                  <CardDescription>
                    {t("manage-classes-desc") || "Create and manage classes, add students, and organize your schools"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    {t("manage-classes-details") || "Add new students, organize classes, and assign Pokémon to your students."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button" 
                    onClick={() => setCurrentView("classes")}
                  >
                    {t("manage-classes") || "Manage Classes"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sword className="h-6 w-6 text-red-500" />
                    {t("battle-mode") || "Battle Mode"}
                  </CardTitle>
                  <CardDescription>
                    {t("battle-mode-desc") || "Create and manage competition battles between students or classes"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    {t("battle-mode-details") || "Set up competitive activities, manage scoring, and track student performance."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button"
                    onClick={() => setCurrentView("battle")}
                  >
                    {t("enter-battle-mode") || "Enter Battle Mode"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-6 w-6 text-green-500" />
                    {t("school-collaboration") || "School Collaboration"}
                  </CardTitle>
                  <CardDescription>
                    {t("school-collab-desc") || "Collaborate with other teachers in the same schools"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    {t("school-collab-details") || "Manage shared access to classes, send collaboration requests, and work with other teachers."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button"
                    onClick={() => setCurrentView("collaboration")}
                  >
                    {t("school-collaboration") || "School Collaboration"}
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
                {t("back-to-dashboard") || "Back to Dashboard"}
              </Button>
              <h2 className="text-2xl font-bold">{t("school-collaboration") || "School Collaboration"}</h2>
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
            <DialogTitle>{t("create-student") || "Create Student Account"}</DialogTitle>
            <DialogDescription>
              {t("create-student-desc") || "Create a new account that a student can use to log in."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="studentUsername">{t("username") || "Username"}</Label>
              <Input
                id="studentUsername"
                value={studentData.username}
                onChange={(e) => setStudentData({...studentData, username: e.target.value})}
                placeholder={t("student-username") || "Student username"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentDisplayName">{t("display-name") || "Display Name"}</Label>
              <Input
                id="studentDisplayName"
                value={studentData.displayName}
                onChange={(e) => setStudentData({...studentData, displayName: e.target.value})}
                placeholder={t("student-display-name") || "Student's display name"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentPassword">{t("password") || "Password"}</Label>
              <Input
                id="studentPassword"
                type="password"
                value={studentData.password}
                onChange={(e) => setStudentData({...studentData, password: e.target.value})}
                placeholder={t("create-password") || "Create a password"}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={handleAddStudent}>
              {t("create-account") || "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
