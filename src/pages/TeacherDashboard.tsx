
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Users, Sword, UserPlus, Shield } from "lucide-react";
import ClassManagement from "@/components/teacher/ClassManagement";
import BattleMode from "@/components/teacher/BattleMode";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"main" | "classes" | "battle">("main");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentData, setStudentData] = useState({
    username: "",
    password: "",
    displayName: "",
  });
  const [teacherData, setTeacherData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const teacherId = localStorage.getItem("teacherId");

  useEffect(() => {
    // Check if user is admin
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
    
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
      <NavBar userType="teacher" />
      
      <div className="container mx-auto py-8 px-4">
        {currentView === "main" ? (
          <>
            <Card className="mb-6 border-none shadow-lg pokemon-gradient-bg text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome, Pokémon Teacher!</h2>
                    <p>Manage your classes and create exciting battles for your students.</p>
                  </div>
                  {isAdmin && (
                    <Button 
                      onClick={() => navigate("/admin-dashboard")}
                      className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
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
              Create Student Account
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-500" />
                    Manage Classes/Schools
                  </CardTitle>
                  <CardDescription>
                    Create and manage classes, add students, and organize your schools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Add new students, organize classes, and assign Pokémon to your students.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button" 
                    onClick={() => setCurrentView("classes")}
                  >
                    Manage Classes
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sword className="h-6 w-6 text-red-500" />
                    Battle Mode
                  </CardTitle>
                  <CardDescription>
                    Create and manage competition battles between students or classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Set up competitive activities, manage scoring, and track student performance.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button"
                    onClick={() => setCurrentView("battle")}
                  >
                    Enter Battle Mode
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        ) : currentView === "classes" ? (
          <ClassManagement onBack={() => setCurrentView("main")} />
        ) : (
          <BattleMode onBack={() => setCurrentView("main")} />
        )}
      </div>
      
      {/* Add Student Dialog */}
      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Student Account</DialogTitle>
            <DialogDescription>
              Create a new account that a student can use to log in.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="studentUsername">Username</Label>
              <Input
                id="studentUsername"
                value={studentData.username}
                onChange={(e) => setStudentData({...studentData, username: e.target.value})}
                placeholder="Student username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentDisplayName">Display Name</Label>
              <Input
                id="studentDisplayName"
                value={studentData.displayName}
                onChange={(e) => setStudentData({...studentData, displayName: e.target.value})}
                placeholder="Student's display name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentPassword">Password</Label>
              <Input
                id="studentPassword"
                type="password"
                value={studentData.password}
                onChange={(e) => setStudentData({...studentData, password: e.target.value})}
                placeholder="Create a password"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
