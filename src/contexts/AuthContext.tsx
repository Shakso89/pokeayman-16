
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

type UserType = 'teacher' | 'student' | 'admin' | null;

interface AuthState {
  isLoggedIn: boolean;
  userType: UserType;
  userId: string | null;
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  logout: () => Promise<boolean>;
  refreshAuthState: () => Promise<void>;
}

const initialAuthState: AuthState = {
  isLoggedIn: false,
  userType: null,
  userId: null,
  session: null,
  user: null,
  loading: true,
  isAdmin: false
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const isLoggingOut = useRef(false);
  
  // Clear all auth data from localStorage and state
  const clearAuthState = () => {
    setAuthState({
      ...initialAuthState,
      loading: false
    });
    
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("studentId");
    localStorage.removeItem("teacherUsername");
    localStorage.removeItem("studentDisplayName");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("studentClassId");
  };

  // Setup teacher auth data
  const setupTeacherAuth = (
    id: string,
    userData: any,
    isAdminUser: boolean
  ) => {
    setAuthState(prev => ({
      ...prev,
      isLoggedIn: true,
      userType: "teacher",
      userId: id,
      isAdmin: isAdminUser,
      loading: false
    }));

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", "teacher");
    localStorage.setItem("teacherId", id);
    localStorage.setItem(
      "teacherUsername",
      userData.username || userData.email?.split("@")[0] || ""
    );

    if (isAdminUser) localStorage.setItem("isAdmin", "true");
    
    // Update last login in database
    try {
      supabase.from('teachers').update({
        last_login: new Date().toISOString()
      }).eq('id', id);
    } catch (e) {
      console.error("Error updating teacher last login:", e);
    }
  };

  // Setup student auth data
  const setupStudentAuth = (id: string, data: any) => {
    setAuthState(prev => ({
      ...prev,
      isLoggedIn: true,
      userType: "student",
      userId: id,
      isAdmin: false,
      loading: false
    }));

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", "student");
    localStorage.setItem("studentId", id);
    localStorage.setItem("studentDisplayName", data.display_name || data.username || "");
    if (data.class_id) localStorage.setItem("studentClassId", data.class_id);
    
    // Update last login in database
    try {
      supabase.from('students').update({
        last_login: new Date().toISOString()
      }).eq('id', id);
    } catch (e) {
      console.error("Error updating student last login:", e);
    }
  };

  // Process session data
  const handleSession = async (newSession: Session) => {
    try {
      const currentUser = newSession.user;
      
      setAuthState(prev => ({
        ...prev,
        session: newSession,
        user: currentUser
      }));

      if (currentUser) {
        const userData = currentUser.user_metadata || {};

        // Admin check by email and username
        const adminEmails = [
          "ayman.soliman.cc@gmail.com",
          "admin@pokeayman.com",
          "admin@example.com",
        ];
        const isAdminEmail = adminEmails.includes(
          (currentUser.email || "").toLowerCase()
        );
        const isAdminUser =
          isAdminEmail ||
          userData.username === "Admin" ||
          userData.username === "Ayman";

        const userTypeFromMeta = userData.user_type as UserType;

        if (userTypeFromMeta === "student") {
          setupStudentAuth(currentUser.id, userData);
        } else {
          // Check if user is student by looking up DB
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
      }
    } catch (error) {
      console.error("Error in handleSession:", error);
      // Fallback in error case
      const sessionUser = newSession.user;
      if (sessionUser) {
        setAuthState(prev => ({
          ...prev,
          isLoggedIn: true,
          userType: "teacher",
          userId: sessionUser.id,
          loading: false
        }));
      }
    }
  };

  // Refresh auth state from supabase
  const refreshAuthState = async () => {
    console.log("Refreshing auth state...");
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const { data: { session: existingSession } } = await supabase.auth.getSession();

      if (existingSession) {
        await handleSession(existingSession);
      } else {
        // Fallback to localStorage (backward compatibility)
        const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const localUserType = localStorage.getItem("userType") as UserType;

        if (localIsLoggedIn && localUserType) {
          const userId = localUserType === "teacher" ? 
            localStorage.getItem("teacherId") : 
            localStorage.getItem("studentId");
            
          setAuthState({
            ...initialAuthState,
            isLoggedIn: true,
            userType: localUserType,
            userId,
            isAdmin: localStorage.getItem("isAdmin") === "true",
            loading: false
          });
          
          // Check and update database if needed
          if (userId) {
            if (localUserType === 'student') {
              const { data } = await supabase
                .from('students')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
                
              if (data) {
                console.log("Found student in database, updating session data");
                // Update localStorage with latest data
                localStorage.setItem("studentDisplayName", data.display_name || data.username);
                if (data.class_id) localStorage.setItem("studentClassId", data.class_id);
                
                // Update last login
                await supabase
                  .from('students')
                  .update({ last_login: new Date().toISOString() })
                  .eq('id', userId);
              }
            } else if (localUserType === 'teacher') {
              const { data } = await supabase
                .from('teachers')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
                
              if (data) {
                console.log("Found teacher in database, updating session data");
                localStorage.setItem("teacherUsername", data.username);
                
                // Update last login
                await supabase
                  .from('teachers')
                  .update({ last_login: new Date().toISOString() })
                  .eq('id', userId);
              }
            }
          }
        } else {
          clearAuthState();
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      clearAuthState();
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  // Logout function with protection against multiple calls
  const logout = async () => {
    try {
      // Prevent multiple logout attempts
      if (isLoggingOut.current) {
        console.log("Logout already in progress, skipping duplicate request");
        return true;
      }
      
      isLoggingOut.current = true;
      setAuthState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      clearAuthState();

      // Only show toast once
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
      setAuthState(prev => ({ ...prev, loading: false }));
      // Reset the logout flag after a short delay to prevent immediate re-attempts
      setTimeout(() => {
        isLoggingOut.current = false;
      }, 1000);
    }
  };

  // Effect for setting up auth state listener and initial check
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          // Use setTimeout to avoid potential recursive auth state issue
          setTimeout(() => {
            handleSession(session);
          }, 0);
        }
      } else if (event === "SIGNED_OUT") {
        // Only clear auth state if not already in the process of logging out
        if (!isLoggingOut.current) {
          clearAuthState();
        }
      }
    });

    // Initial session check
    refreshAuthState();
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{
      ...authState,
      logout,
      refreshAuthState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
