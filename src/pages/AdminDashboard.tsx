
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

// Types for our user data
interface TeacherData {
  id: string;
  username: string;
  displayName: string;
  schools?: string[];
  students?: string[];
  createdAt: string;
  lastLogin?: string;
  timeSpent?: number; // in minutes
  expiryDate?: string;
  subscriptionType?: "trial" | "monthly" | "annual";
  isActive: boolean;
}

interface StudentData {
  id: string;
  username: string;
  displayName: string;
  teacherId: string;
  createdAt: string;
  lastLogin?: string;
  timeSpent?: number; // in minutes
  coinsSpent?: number;
  isActive: boolean;
}

const AdminDashboard: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [activationMessage, setActivationMessage] = useState("");
  
  // Check if current user is Admin
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  useEffect(() => {
    // Load teachers data
    const storedTeachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    
    // Process teacher data to include additional admin metrics
    const processedTeachers = storedTeachers.map((teacher: any) => {
      // Calculate number of schools
      const numSchools = teacher.schools ? teacher.schools.length : 0;
      
      // Calculate number of students
      const numStudents = teacher.students ? teacher.students.length : 0;
      
      return {
        ...teacher,
        numSchools,
        numStudents,
        // Default values for metrics that might not exist yet
        timeSpent: teacher.timeSpent || 0,
        lastLogin: teacher.lastLogin || "Never",
        expiryDate: teacher.expiryDate || "No expiry",
        subscriptionType: teacher.subscriptionType || "trial",
        isActive: teacher.isActive !== false, // Default to true if not specified
      };
    });
    
    setTeachers(processedTeachers);
    
    // Load students data
    const storedStudents = JSON.parse(localStorage.getItem("students") || "[]");
    
    // Get student Pokémon to calculate coins spent
    const studentPokemon = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
    
    // Process student data
    const processedStudents = storedStudents.map((student: any) => {
      // Find student's coin data
      const pokemonData = studentPokemon.find((sp: any) => sp.studentId === student.id);
      const coinsSpent = pokemonData ? pokemonData.coins || 0 : 0;
      
      return {
        ...student,
        coinsSpent,
        timeSpent: student.timeSpent || 0,
        lastLogin: student.lastLogin || "Never",
        isActive: student.isActive !== false, // Default to true if not specified
      };
    });
    
    setStudents(processedStudents);
  }, []);
  
  const handleToggleAccount = (userId: string, userType: "teacher" | "student") => {
    if (userType === "teacher") {
      const updatedTeachers = teachers.map(teacher => {
        if (teacher.id === userId) {
          const newIsActive = !teacher.isActive;
          return { ...teacher, isActive: newIsActive };
        }
        return teacher;
      });
      
      setTeachers(updatedTeachers);
      localStorage.setItem("teachers", JSON.stringify(updatedTeachers));
      
      toast({
        title: "Teacher account updated",
        description: `Teacher account has been ${updatedTeachers.find(t => t.id === userId)?.isActive ? "activated" : "frozen"}`,
      });
      
      // Set a message for the teacher
      setActivationMessage(`Your account has been ${updatedTeachers.find(t => t.id === userId)?.isActive ? "activated" : "frozen"} by an admin.`);
      
    } else {
      const updatedStudents = students.map(student => {
        if (student.id === userId) {
          const newIsActive = !student.isActive;
          return { ...student, isActive: newIsActive };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      
      toast({
        title: "Student account updated",
        description: `Student account has been ${updatedStudents.find(s => s.id === userId)?.isActive ? "activated" : "frozen"}`,
      });
    }
  };
  
  const handleDeleteAccount = (userId: string, userType: "teacher" | "student") => {
    if (userType === "teacher") {
      const filteredTeachers = teachers.filter(teacher => teacher.id !== userId);
      setTeachers(filteredTeachers);
      localStorage.setItem("teachers", JSON.stringify(filteredTeachers));
      
      toast({
        title: "Teacher account deleted",
        description: "Teacher account has been permanently deleted",
      });
      
    } else {
      const filteredStudents = students.filter(student => student.id !== userId);
      setStudents(filteredStudents);
      localStorage.setItem("students", JSON.stringify(filteredStudents));
      
      toast({
        title: "Student account deleted",
        description: "Student account has been permanently deleted",
      });
    }
  };

  // Redirect if not admin
  if (!isAdmin || !isLoggedIn) {
    return <Navigate to="/teacher-login" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar userType="teacher" userName="Admin" />
      
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6 border-none shadow-lg bg-gradient-to-br from-purple-600 to-blue-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="mt-2">Full system oversight and controls</p>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="teachers">
          <TabsList className="mb-6">
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teachers">
            <div className="grid gap-4">
              {teachers.map((teacher) => (
                <Card key={teacher.id} className="relative">
                  {teacher.username === "Admin" && (
                    <div className="absolute top-0 right-0 m-2">
                      <Badge className="bg-purple-500">Admin Account</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>{teacher.displayName} ({teacher.username})</span>
                      <Badge className={teacher.isActive ? "bg-green-500" : "bg-red-500"}>
                        {teacher.isActive ? "Active" : "Frozen"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Account Type</p>
                        <p>{teacher.subscriptionType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p>{teacher.expiryDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p>{new Date(teacher.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Login</p>
                        <p>{teacher.lastLogin}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time Spent</p>
                        <p>{teacher.timeSpent} minutes</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Classes</p>
                        <p>{teacher.numSchools} schools, {teacher.numStudents} students</p>
                      </div>
                    </div>
                    
                    {teacher.username !== "Admin" && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleToggleAccount(teacher.id, "teacher")}
                          variant={teacher.isActive ? "destructive" : "default"}
                        >
                          {teacher.isActive ? "Freeze Account" : "Unfreeze Account"}
                        </Button>
                        <Button 
                          onClick={() => handleDeleteAccount(teacher.id, "teacher")}
                          variant="outline"
                          className="text-red-500 border-red-500 hover:bg-red-50"
                        >
                          Delete Account
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="students">
            <div className="grid gap-4">
              {students.map((student) => (
                <Card key={student.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>{student.displayName} ({student.username})</span>
                      <Badge className={student.isActive ? "bg-green-500" : "bg-red-500"}>
                        {student.isActive ? "Active" : "Frozen"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Teacher ID</p>
                        <p>{student.teacherId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p>{new Date(student.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Login</p>
                        <p>{student.lastLogin}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time Spent</p>
                        <p>{student.timeSpent} minutes</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Coins Spent</p>
                        <p>{student.coinsSpent}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleToggleAccount(student.id, "student")}
                        variant={student.isActive ? "destructive" : "default"}
                      >
                        {student.isActive ? "Freeze Account" : "Unfreeze Account"}
                      </Button>
                      <Button 
                        onClick={() => handleDeleteAccount(student.id, "student")}
                        variant="outline"
                        className="text-red-500 border-red-500 hover:bg-red-50"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
