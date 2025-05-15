
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Student } from "@/types/database";

export const useStudentAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const loginStudent = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Check if input is an email (contains @)
      const isEmail = usernameOrEmail.includes('@');
      
      // Try to fetch student from Supabase database
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq(isEmail ? 'email' : 'username', usernameOrEmail)
        .eq('password', password)
        .eq('is_active', true) // Only active students can login
        .limit(1);
        
      if (error) {
        throw error;
      }
      
      if (!students || students.length === 0) {
        throw new Error("Invalid username/email or password");
      }
      
      const student = students[0] as Student;
      
      // Update last login time
      await supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('id', student.id);
      
      // Store student session in localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "student");
      localStorage.setItem("studentId", student.id);
      localStorage.setItem("studentUsername", student.username);
      localStorage.setItem("studentDisplayName", student.display_name || student.username);
      if (student.class_id) {
        localStorage.setItem("studentClassId", student.class_id);
      }
      if (student.teacher_id) {
        localStorage.setItem("teacherId", student.teacher_id);
      }
      
      // Return success and student data
      return {
        success: true,
        student
      };
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const logoutStudent = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentUsername");
    localStorage.removeItem("studentDisplayName");
    localStorage.removeItem("studentClassId");
    localStorage.removeItem("teacherId");
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account."
    });
  };
  
  return {
    isLoading,
    loginStudent,
    logoutStudent
  };
};
