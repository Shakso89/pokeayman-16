
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      console.log("Attempting student login for username:", username);
      
      // Get student data from database
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error("Database error during login:", error);
        return { success: false, student: null, message: "Login failed. Please try again." };
      }

      if (!student) {
        console.log("No student found with username:", username);
        return { success: false, student: null, message: "Invalid username or password" };
      }

      console.log("Student found, verifying password...");

      // For now, we'll do a simple password comparison
      // In production, you should use proper password hashing
      if (student.password_hash !== password) {
        console.log("Password verification failed");
        return { success: false, student: null, message: "Invalid username or password" };
      }

      console.log("Login successful for student:", student.id);

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
      console.log("Starting student signup process...");
      
      // Check if username already exists
      const { data: existingStudent, error: checkError } = await supabase
        .from('students')
        .select('id')
        .eq('username', signupData.username)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing username:", checkError);
        return { success: false, student: null, message: "Signup failed. Please try again." };
      }

      if (existingStudent) {
        console.log("Username already exists:", signupData.username);
        return { success: false, student: null, message: "Username already exists" };
      }

      // Verify that the teacher exists
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id, display_name')
        .eq('username', signupData.teacherUsername)
        .maybeSingle();

      if (teacherError) {
        console.error("Error checking teacher:", teacherError);
        return { success: false, student: null, message: "Error verifying teacher. Please try again." };
      }

      if (!teacher) {
        console.log("Teacher not found:", signupData.teacherUsername);
        return { success: false, student: null, message: "Teacher username not found" };
      }

      console.log("Teacher verified:", teacher.id);

      // Generate a UUID for the student
      const studentId = crypto.randomUUID();

      // Create student record (storing password as plain text for now - in production use proper hashing)
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert({
          id: studentId,
          username: signupData.username,
          password_hash: signupData.password, // In production, hash this properly
          display_name: signupData.displayName,
          school_name: signupData.schoolName,
          teacher_username: signupData.teacherUsername,
          teacher_id: teacher.id,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (studentError) {
        console.error("Error creating student record:", studentError);
        return { success: false, student: null, message: studentError.message };
      }

      console.log("Student record created:", newStudent.id);

      // Create student profile
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: studentId,
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

      console.log("Student signup completed successfully");

      return {
        success: true,
        student: {
          id: studentId,
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
