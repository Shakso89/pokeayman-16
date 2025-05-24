import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { Session, User } from '@supabase/supabase-js';

type UserType = 'teacher' | 'student' | 'admin' | null;

interface AuthState {
  isLoggedIn: boolean;
  userType: UserType;
  userId: string | null;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
}

// List of admin emails for quick reference
const ADMIN_EMAILS = [
  "ayman.soliman.tr@gmail.com",
  "ayman.soliman.cc@gmail.com",
  "admin@pokeayman.com",
  "admin@example.com",
];

// Admin usernames
const ADMIN_USERNAMES = ["Admin", "Ayman"];

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    userType: null,
    userId: null,
    session: null,
    user: null,
    isAdmin: false
  });

  // Update auth state with new values
  const updateAuthState = (newState: Partial<AuthState>) => {
    setAuthState(prevState => ({ ...prevState, ...newState }));
  };

  // Check if user is admin based on email or username
  const checkIsAdmin = (user: User | null, username?: string): boolean => {
    if (!user && !username) return false;
    
    const email = user?.email?.toLowerCase() || '';
    const storedEmail = localStorage.getItem("userEmail")?.toLowerCase() || '';
    const storedUsername = localStorage.getItem("teacherUsername") || '';
    
    const isAdminEmail = ADMIN_EMAILS.includes(email) || ADMIN_EMAILS.includes(storedEmail);
    const isAdminUsername = username 
      ? ADMIN_USERNAMES.includes(username) 
      : ADMIN_USERNAMES.includes(storedUsername);
    
    return isAdminEmail || isAdminUsername;
  };

  // Handle authentication session
  const handleSession = async (newSession: Session | null) => {
    try {
      if (!newSession || !newSession.user) {
        clearAuthState();
        return;
      }
      
      const currentUser = newSession.user;
      const userData = currentUser.user_metadata || {};
      const username = userData.username || localStorage.getItem("teacherUsername");
      
      // Check if user is admin
      const isAdminUser = checkIsAdmin(currentUser, username);
      
      // Store email in localStorage for reference
      if (currentUser.email) {
        localStorage.setItem("userEmail", currentUser.email);
        
        // Special handling for admin emails that were previously getting stuck
        if (isSpecialAdminEmail(currentUser.email)) {
          console.log("Special admin email detected:", currentUser.email);
          setupTeacherAuth(currentUser.id, {
            username: "Ayman", 
            email: currentUser.email
          }, true);
          return;
        }
      }
      
      // For admin users, set up as teacher type
      if (isAdminUser) {
        setupTeacherAuth(currentUser.id, {
          username: username || currentUser.email?.split('@')[0] || 'Admin',
          email: currentUser.email
        }, true);
        return;
      }
      
      // Determine if user is student or teacher
      const userTypeFromMeta = userData.user_type as UserType;
      
      if (userTypeFromMeta === "student") {
        setupStudentAuth(currentUser.id, userData);
      } else {
        // Check database for student record
        const { data: studentData } = await supabase
          .from("students")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (studentData) {
          setupStudentAuth(currentUser.id, studentData);
        } else {
          setupTeacherAuth(currentUser.id, userData, false);
        }
      }
    } catch (error) {
      console.error("Error in handleSession:", error);
      
      // Try to recover with basic session data
      if (newSession?.user) {
        const sessionUser = newSession.user;
        const isAdminUser = checkIsAdmin(sessionUser);
        
        updateAuthState({
          isLoggedIn: true,
          userType: isAdminUser ? "teacher" : "teacher", // Default to teacher
          userId: sessionUser.id,
          session: newSession,
          user: sessionUser,
          isAdmin: isAdminUser
        });
      }
    }
  };

  // Helper function to check special admin emails
  const isSpecialAdminEmail = (email: string): boolean => {
    return email.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
           email.toLowerCase() === "ayman.soliman.cc@gmail.com";
  };

  // Setup student authentication
  const setupStudentAuth = (id: string, data: any) => {
    // Update state
    updateAuthState({
      isLoggedIn: true,
      userType: "student",
      userId: id,
      isAdmin: false
    });

    // Update localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", "student");
    localStorage.setItem("studentId", id);
    localStorage.setItem("studentDisplayName", data.display_name || data.username || "");
    if (data.class_id) localStorage.setItem("studentClassId", data.class_id);
    
    console.log("Student auth setup complete", { id, displayName: data.display_name || data.username });
  };

  // Setup teacher authentication
  const setupTeacherAuth = (
    id: string,
    userData: any,
    isAdminUser: boolean = false
  ) => {
    // Update state
    updateAuthState({
      isLoggedIn: true,
      userType: "teacher",
      userId: id,
      isAdmin: isAdminUser
    });

    // Update localStorage with consistent values
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", "teacher");
    localStorage.setItem("teacherId", id);
    localStorage.setItem(
      "teacherUsername",
      userData.username || userData.email?.split("@")[0] || ""
    );

    if (isAdminUser) localStorage.setItem("isAdmin", "true");
    
    console.log("Teacher auth setup complete", { id, isAdmin: isAdminUser });
  };

  // Clear authentication state
  const clearAuthState = () => {
    console.log("Clearing auth state...");
    
    updateAuthState({
      isLoggedIn: false,
      userType: null,
      userId: null,
      session: null,
      user: null,
      isAdmin: false
    });

    // Clear all auth-related localStorage items
    const authKeys = [
      "isLoggedIn", "userType", "teacherId", "studentId", 
      "teacherUsername", "studentDisplayName", "isAdmin", 
      "studentClassId", "userEmail", "studentName", "studentSchoolId"
    ];
    
    authKeys.forEach(key => localStorage.removeItem(key));
    
    console.log("Auth state cleared");
  };

  // Load auth state from localStorage (fallback method)
  const loadFromLocalStorage = () => {
    const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const localUserType = localStorage.getItem("userType") as UserType;
    const teacherUsername = localStorage.getItem("teacherUsername");
    const isAdmin = localStorage.getItem("isAdmin") === "true" || 
                   ADMIN_USERNAMES.includes(teacherUsername || '') ||
                   ADMIN_EMAILS.includes(localStorage.getItem("userEmail")?.toLowerCase() || '');

    if (localIsLoggedIn && localUserType) {
      const userId = localUserType === "teacher"
        ? localStorage.getItem("teacherId")
        : localStorage.getItem("studentId");
      
      updateAuthState({
        isLoggedIn: true,
        userType: localUserType,
        userId,
        isAdmin: isAdmin
      });
      
      console.log("Auth state loaded from localStorage:", { 
        userType: localUserType, 
        isAdmin: isAdmin
      });
      
      return true;
    }
    
    return false;
  };

  // Refresh auth state
  const refreshAuthState = async () => {
    console.log("Refreshing auth state...");
    setLoading(true);
    
    try {
      // First load from localStorage for immediate feedback
      loadFromLocalStorage();
      
      // Then try to get session from Supabase
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (existingSession) {
        await handleSession(existingSession);
      } else {
        // If no session and localStorage failed, clear auth state
        if (!loadFromLocalStorage()) {
          clearAuthState();
          console.log("No auth session found");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Keep the localStorage state if it exists
      if (!authState.isLoggedIn) {
        clearAuthState();
      }
    } finally {
      setLoading(false);
    }
  };

  // Simplified logout function
  const logout = async (): Promise<boolean> => {
    try {
      console.log("Starting logout process in useAuth...");

      // Clear auth state first
      clearAuthState();

      // Sign out from Supabase (don't wait for it)
      supabase.auth.signOut().catch((error) => {
        console.error("Supabase signout error (ignored):", error);
      });

      console.log("Logout completed successfully");
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Logout error:", error);
      
      // Force clear state even on error
      clearAuthState();
      
      toast({
        title: "Logout completed",
        description: "You have been logged out.",
      });
      
      return true; // Return true even on error to allow redirect
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth on component mount
  useEffect(() => {
    console.log("Setting up auth state listeners");
    
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (newSession) await handleSession(newSession);
      } else if (event === "SIGNED_OUT") {
        clearAuthState();
      }
    });

    // Initialize auth state
    refreshAuthState();

    return () => subscription.unsubscribe();
  }, []);

  return {
    ...authState,
    loading,
    logout,
    refreshAuthState
  };
};
