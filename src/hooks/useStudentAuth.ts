
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: string;
  username: string;
  display_name: string;
  avatar?: string;
  photos?: string[];
  classId?: string;
  schoolId?: string;
  teacher_name?: string;
  school_name?: string;
}

interface LoginResult {
  success: boolean;
  student: Student;
  message?: string;
}

export const useStudentAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const loginStudent = async (usernameOrEmail: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to verify credentials
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const student = students.find(
        (s: any) => 
          (s.username === usernameOrEmail || s.email === usernameOrEmail) && 
          s.password === password
      );
      
      if (!student) {
        // Failed login
        toast({
          title: "Login Failed",
          description: "Invalid username/email or password",
          variant: "destructive",
        });
        return { success: false, student: {} as Student, message: "Invalid credentials" };
      }
      
      // Successful login - store user data in localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "student");
      localStorage.setItem("studentId", student.id);
      localStorage.setItem("studentName", student.display_name || student.username);
      localStorage.setItem("studentClassId", student.classId || "");
      localStorage.setItem("studentSchoolId", student.schoolId || "");
      
      return { 
        success: true, 
        student: student 
      };
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return { success: false, student: {} as Student, message: "Login error" };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    loginStudent
  };
};
