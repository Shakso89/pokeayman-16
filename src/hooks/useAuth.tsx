
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

  // Handle authentication session
  const handleSession = async (newSession: Session) => {
    try {
      const currentUser = newSession.user;
      
      if (!currentUser) {
        clearAuthState();
        return;
      }
      
      // Set basic auth state from session
      const userData = currentUser.user_metadata || {};
      const userTypeFromMeta = userData.user_type as UserType;
      
      // Check if user is admin
      const isAdminUser = checkIsAdmin(currentUser, userData);
      
      // Determine if user is student or teacher
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
          setupTeacherAuth(currentUser.id, userData, isAdminUser);
        }
      }
    } catch (error) {
      console.error("Error in handleSession:", error);
      // Fallback to basic session data
      const sessionUser = newSession.user;
      if (sessionUser) {
        updateAuthState({
          isLoggedIn: true,
          userType: "teacher",
          userId: sessionUser.id,
          session: newSession,
          user: sessionUser,
          isAdmin: false
        });
      }
    }
  };

  // Check if user is admin based on email or username
  const checkIsAdmin = (user: User, userData: any): boolean => {
    const adminEmails = [
      "ayman.soliman.cc@gmail.com",
      "ayman.soliman.tr@gmail.com",
      "admin@pokeayman.com",
      "admin@example.com",
    ];
    
    const isAdminEmail = adminEmails.includes(
      (user.email || "").toLowerCase()
    );
    
    return isAdminEmail || 
           userData.username === "Admin" || 
           userData.username === "Ayman";
  };

  // Update auth state with new values
  const updateAuthState = (newState: Partial<AuthState>) => {
    setAuthState(prevState => ({ ...prevState, ...newState }));
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
    isAdminUser: boolean
  ) => {
    // Update state
    updateAuthState({
      isLoggedIn: true,
      userType: "teacher",
      userId: id,
      isAdmin: isAdminUser
    });

    // Update localStorage
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
    updateAuthState({
      isLoggedIn: false,
      userType: null,
      userId: null,
      session: null,
      user: null,
      isAdmin: false
    });

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("studentId");
    localStorage.removeItem("teacherUsername");
    localStorage.removeItem("studentDisplayName");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("studentClassId");
    
    console.log("Auth state cleared");
  };

  // Load auth state from localStorage (fallback method)
  const loadFromLocalStorage = () => {
    const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const localUserType = localStorage.getItem("userType") as UserType;

    if (localIsLoggedIn && localUserType) {
      const userId = localUserType === "teacher"
        ? localStorage.getItem("teacherId")
        : localStorage.getItem("studentId");
      
      updateAuthState({
        isLoggedIn: true,
        userType: localUserType,
        userId,
        isAdmin: localStorage.getItem("isAdmin") === "true"
      });
      
      console.log("Auth state loaded from localStorage:", { 
        userType: localUserType, 
        isAdmin: localStorage.getItem("isAdmin") === "true" 
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
      // Try to get session from Supabase
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (existingSession) {
        await handleSession(existingSession);
      } else {
        // Fallback to localStorage if no session
        if (!loadFromLocalStorage()) {
          clearAuthState();
          console.log("No auth session found");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      clearAuthState();

      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      return true;
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
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
