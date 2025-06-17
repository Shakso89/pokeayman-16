
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from "bcryptjs";

interface StudentData {
  id: string;
  username: string;
  display_name: string | null;
  school_name?: string;
  teacher_username?: string;
  teacher_id?: string | null;
}

interface LoginResult {
  success: boolean;
  student: StudentData | null;
  message?: string;
}

interface SignupData {
  username: string;
  password: string;
  displayName: string;
  schoolName: string;
  teacherUsername: string;
}

export const useStudentAuthNew = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const loginStudent = async (username: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    
    try {
      // Get student data from database
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !student) {
        return { success: false, student: null, message: "Invalid username or password" };
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, student.password_hash);

      if (!passwordValid) {
        return { success: false, student: null, message: "Invalid username or password" };
      }

      // Update last login
      await supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('id', student.id);

      return {
        success: true,
        student: {
          id: student.id,
          username: student.username,
          display_name: student.display_name,
          school_name: student.school_name,
          teacher_username: student.teacher_username,
          teacher_id: student.teacher_id
        }
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, student: null, message: error.message || "Login error" };
    } finally {
      setIsLoading(false);
    }
  };

  const signupStudent = async (signupData: SignupData): Promise<LoginResult> => {
    setIsLoading(true);

    try {
      // Check if username already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('username', signupData.username)
        .maybeSingle();

      if (existingStudent) {
        return { success: false, student: null, message: "Username already exists" };
      }

      // Verify that the teacher exists
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id, display_name')
        .eq('username', signupData.teacherUsername)
        .maybeSingle();

      if (!teacher) {
        return { success: false, student: null, message: "Teacher username not found" };
      }

      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${signupData.username}@student.local`,
        password: signupData.password,
        options: {
          data: {
            user_type: 'student',
            username: signupData.username,
            display_name: signupData.displayName
          }
        }
      });

      if (authError || !authData.user) {
        return { success: false, student: null, message: authError?.message || "Failed to create account" };
      }

      // Hash password for storage
      const hashedPassword = await bcrypt.hash(signupData.password, 10);

      // Create student record
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          id: authData.user.id,
          username: signupData.username,
          password_hash: hashedPassword,
          display_name: signupData.displayName,
          school_name: signupData.schoolName,
          teacher_username: signupData.teacherUsername,
          teacher_id: teacher.id,
          is_active: true,
          created_at: new Date().toISOString()
        });

      if (studentError) {
        return { success: false, student: null, message: studentError.message };
      }

      // Create student profile
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: authData.user.id,
          username: signupData.username,
          display_name: signupData.displayName,
          school_name: signupData.schoolName,
          teacher_id: teacher.id,
          coins: 0,
          spent_coins: 0
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Continue even if profile creation fails
      }

      return {
        success: true,
        student: {
          id: authData.user.id,
          username: signupData.username,
          display_name: signupData.displayName,
          school_name: signupData.schoolName,
          teacher_username: signupData.teacherUsername,
          teacher_id: teacher.id
        }
      };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, student: null, message: error.message || "Signup error" };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    loginStudent,
    signupStudent
  };
};
