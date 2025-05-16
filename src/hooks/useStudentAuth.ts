
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  username: string;
  display_name: string;
  avatar?: string;
  photos?: string[];
  class_id?: string;
  teacher_id?: string;
  teacher_name?: string;
  school_name?: string;
}

interface LoginResult {
  success: boolean;
  student: Student | null;
  message?: string;
}

export const useStudentAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const loginStudent = async (usernameOrEmail: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    
    try {
      // Check if the username/email and password match in the students table
      const { data: student, error } = await supabase
        .from('students')
        .select(`
          id,
          username,
          display_name,
          class_id,
          teacher_id
        `)
        .or(`username.eq.${usernameOrEmail}`)
        .eq('password', password)
        .maybeSingle();
      
      if (error) {
        console.error("Database query error:", error);
        throw error;
      }
      
      if (!student) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return { success: false, student: null, message: "Invalid credentials" };
      }
      
      // Get teacher details if available
      let teacherName = "Unknown";
      
      if (student.teacher_id) {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('display_name')
          .eq('id', student.teacher_id)
          .maybeSingle();
          
        if (teacher) {
          teacherName = teacher.display_name;
        }
      }
      
      // Find school name based on teacher's school
      let schoolName = "Unknown";
      
      // Update last login time
      await supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('id', student.id);
      
      // Set session data
      const studentData: Student = {
        ...student,
        teacher_name: teacherName,
        school_name: schoolName
      };
      
      return { 
        success: true, 
        student: studentData
      };
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      return { success: false, student: null, message: "Login error" };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    loginStudent
  };
};
