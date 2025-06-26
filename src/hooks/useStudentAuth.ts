
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useStudentAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginStudent = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("🔐 Student login attempt:", username);

      // Check if student exists in database
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !student) {
        console.error("Student not found:", error);
        return { success: false, message: "Invalid username or password" };
      }

      // Simple password check (in production, use proper hashing)
      if (student.password_hash !== password) {
        return { success: false, message: "Invalid username or password" };
      }

      if (!student.is_active || student.is_frozen) {
        return { success: false, message: "Account is inactive or frozen" };
      }

      // Update last login
      await supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('id', student.id);

      // Set local storage for session
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "student");
      localStorage.setItem("studentId", student.id);
      localStorage.setItem("studentUsername", student.username);
      localStorage.setItem("studentName", student.display_name || student.username);
      localStorage.setItem("studentDisplayName", student.display_name || student.username);

      console.log("✅ Student login successful");
      return { success: true };
    } catch (error) {
      console.error("❌ Student login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userType");
      localStorage.removeItem("studentId");
      localStorage.removeItem("studentUsername");
      localStorage.removeItem("studentName");
      localStorage.removeItem("studentDisplayName");
      
      return { success: true };
    } catch (error) {
      console.error("❌ Logout error:", error);
      return { success: false };
    }
  };

  return {
    isLoading,
    loginStudent,
    logout
  };
};
