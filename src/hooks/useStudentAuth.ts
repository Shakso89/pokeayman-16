
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
  school_id?: string;
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
      // Check if the username/email and password match in the students table
      const { data: student, error } = await supabase
        .from('students')
        .select(`
          id,
          username,
          display_name,
          class_id,
          school_id,
          teacher_id
        `)
        .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
        .eq('password', password)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (!student) {
        toast({
          title: "Login Failed",
          description: "Invalid username/email or password",
          variant: "destructive",
        });
        return { success: false, student: {} as Student, message: "Invalid credentials" };
      }
      
      // Get teacher and school details if available
      let teacherName = "Unknown";
      let schoolName = "Unknown";
      
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
      
      if (student.school_id) {
        const { data: school } = await supabase
          .from('schools')
          .select('name')
          .eq('id', student.school_id)
          .maybeSingle();
          
        if (school) {
          schoolName = school.name;
        }
      }
      
      // Update last login time
      await supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('id', student.id);
      
      // Set session data
      const studentData = {
        ...student,
        teacher_name: teacherName,
        school_name: schoolName
      };
      
      return { 
        success: true, 
        student: studentData as Student
      };
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login",
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
