
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Users, UserPlus, Shield, School, MessageSquare, BarChart, ChevronLeft } from "lucide-react";
import ClassManagement from "@/components/teacher/ClassManagement";
import SchoolCollaboration from "@/components/teacher/SchoolCollaboration";
import SchoolManagement from "@/components/teacher/SchoolManagement";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"main" | "classes" | "collaboration">("main");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentData, setStudentData] = useState({
    username: "",
    password: "",
    displayName: "",
  });
  const [teacherData, setTeacherData] = useState<any>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  
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
        title: "Error",
        description: "Please fill all fields",
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
        title: "Error",
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
      description: "Student added successfully",
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
                    <h2 className="text-3xl font-bold mb-2">Welcome Teacher</h2>
                    <p>Manage your classes, students and more.</p>
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
              Create Student
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-6 w-6 text-blue-500" />
                    Manage Classes
                  </CardTitle>
                  <CardDescription>
                    {isAdmin ? "Manage schools and their classes" : "Manage your classes and students"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    {isAdmin 
                      ? "Create, update and delete schools and classes" 
                      : "Create and manage classes, add students"}
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
                    <MessageSquare className="h-6 w-6 text-green-500" />
                    Messages
                  </CardTitle>
                  <CardDescription>
                    School Collaboration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Connect with other schools and teachers
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button"
                    onClick={() => navigate("/teacher/messages")}
                  >
                    Messages
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:shadow-lg transition-all pokemon-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-6 w-6 text-purple-500" />
                    Reports & Analytics
                  </CardTitle>
                  <CardDescription>
                    Student Participation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Track student engagement and progress
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full pokemon-button"
                    onClick={() => navigate("/teacher/reports")}
                  >
                    Reports & Analytics
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        ) : currentView === "classes" ? (
          selectedSchoolId ? (
            <ClassManagement 
              onBack={() => setSelectedSchoolId(null)}
              schoolId={selectedSchoolId}
              teacherId={teacherId || ""}
            />
          ) : (
            <SchoolManagement 
              onBack={() => setCurrentView("main")} 
              onSelectSchool={(schoolId) => setSelectedSchoolId(schoolId)}
              teacherId={teacherId || ""}
            />
          )
        ) : (
          <div>
            <div className="flex items-center mb-6">
              <Button variant="outline" onClick={() => setCurrentView("main")} className="mr-4">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold">School Collaboration</h2>
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
            <DialogTitle>Create Student</DialogTitle>
            <DialogDescription>
              Create a new student account.
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
                placeholder="Student display name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentPassword">Password</Label>
              <Input
                id="studentPassword"
                type="password"
                value={studentData.password}
                onChange={(e) => setStudentData({...studentData, password: e.target.value})}
                placeholder="Create password"
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

