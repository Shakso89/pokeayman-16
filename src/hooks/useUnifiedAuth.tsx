
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  isLoggedIn: boolean;
  userType: 'student' | 'teacher' | null;
  userId: string | null;
  username: string | null;
  loading: boolean;
}

export const useUnifiedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    userType: null,
    userId: null,
    username: null,
    loading: true
  });
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userType = localStorage.getItem("userType") as 'student' | 'teacher' | null;
    const userId = localStorage.getItem("studentId") || localStorage.getItem("teacherId") || null;
    const username = localStorage.getItem("studentUsername") || localStorage.getItem("teacherUsername") || null;

    setAuthState({
      isLoggedIn,
      userType,
      userId,
      username,
      loading: false
    });
  };

  const loginStudent = async (username: string, password: string) => {
    try {
      console.log("🔐 Student login attempt:", username);

      // Check if student exists in database
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .single();

      if (error || !student) {
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

      // Set local storage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "student");
      localStorage.setItem("studentId", student.id);
      localStorage.setItem("studentUsername", student.username);
      localStorage.setItem("studentName", student.display_name || student.username);

      checkAuthState();
      
      toast({
        title: "Welcome!",
        description: `Logged in as ${student.display_name || student.username}`,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Student login error:", error);
      return { success: false, message: "Login failed" };
    }
  };

  const loginTeacher = async (username: string, password: string) => {
    try {
      console.log("🔐 Teacher login attempt:", username);

      // Check if teacher exists in database
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !teacher) {
        return { success: false, message: "Invalid username or password" };
      }

      // Verify password (you might want to use bcrypt here)
      if (teacher.password !== password) {
        return { success: false, message: "Invalid username or password" };
      }

      if (!teacher.is_active || teacher.is_frozen) {
        return { success: false, message: "Account is inactive or frozen" };
      }

      // Update last login
      await supabase
        .from('teachers')
        .update({ last_login: new Date().toISOString() })
        .eq('id', teacher.id);

      // Set local storage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "teacher");
      localStorage.setItem("teacherId", teacher.id);
      localStorage.setItem("teacherUsername", teacher.username);
      localStorage.setItem("userEmail", teacher.email || teacher.username);

      checkAuthState();

      toast({
        title: "Welcome!",
        description: `Logged in as ${teacher.display_name || teacher.username}`,
      });

      return { success: true, redirect: teacher.role === 'owner' ? '/admin-dashboard' : '/teacher-dashboard' };
    } catch (error) {
      console.error("❌ Teacher login error:", error);
      return { success: false, message: "Login failed" };
    }
  };

  const logout = async () => {
    try {
      console.log("🔓 Starting logout process...");

      // Sign out from Supabase if signed in
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn("Supabase signout warning:", error);
      }

      // Clear all localStorage
      localStorage.clear();

      // Update auth state
      setAuthState({
        isLoggedIn: false,
        userType: null,
        userId: null,
        username: null,
        loading: false
      });

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });

      // Navigate to home
      navigate('/', { replace: true });

      return { success: true };
    } catch (error) {
      console.error("❌ Logout error:", error);
      return { success: false };
    }
  };

  return {
    ...authState,
    loginStudent,
    loginTeacher,
    logout,
    checkAuthState
  };
};
