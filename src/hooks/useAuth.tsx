import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { Session } from '@supabase/supabase-js';
import { AuthState } from './auth/types';
import { handleSession } from './auth/sessionHandler';
import { clearAuthState, loadFromLocalStorage } from './auth/authStateUtils';

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

  // Clear auth state wrapper
  const clearAuthStateWrapper = () => {
    clearAuthState(updateAuthState);
  };

  // Check authentication state more thoroughly
  const checkAuthState = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userType = localStorage.getItem("userType") as "teacher" | "student" | null;
    const teacherId = localStorage.getItem("teacherId");
    const studentId = localStorage.getItem("studentId");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    console.log("Auth state check:", { isLoggedIn, userType, teacherId, studentId, isAdmin });

    if (isLoggedIn && userType) {
      const userId = userType === "teacher" ? teacherId : studentId;
      if (userId) {
        updateAuthState({
          isLoggedIn: true,
          userType,
          userId,
          isAdmin,
          session: null,
          user: null
        });
        return true;
      }
    }
    
    return false;
  };

  // Refresh auth state - simplified to prevent conflicts
  const refreshAuthState = async () => {
    console.log("Refreshing auth state...");
    setLoading(true);
    
    try {
      // First check localStorage for immediate feedback
      const hasLocalAuth = checkAuthState();
      
      // Only check Supabase session if we don't have local auth
      if (!hasLocalAuth) {
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession) {
          await handleSession(existingSession, updateAuthState, clearAuthStateWrapper);
        } else {
          // If no session and no localStorage, clear auth state
          clearAuthStateWrapper();
          console.log("No auth session found");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Keep the localStorage state if it exists and don't clear it on error
      if (!authState.isLoggedIn && !checkAuthState()) {
        clearAuthStateWrapper();
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout function with better error handling
  const logout = async (): Promise<boolean> => {
    try {
      console.log("Starting logout process...");
      setLoading(true);

      // Clear auth state immediately for instant UI feedback
      clearAuthStateWrapper();

      // Clear all localStorage items
      const keysToRemove = [
        'isLoggedIn', 'userType', 'teacherId', 'studentId', 
        'teacherUsername', 'studentUsername', 'userEmail', 'isAdmin'
      ];
      
      keysToRemove.forEach(key => localStorage.removeItem(key));

      try {
        // Sign out from Supabase - don't let this block the logout
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.warn("Supabase signout warning:", error);
          // Don't throw error, just log it - logout should always succeed
        }

        console.log("Logout completed successfully");
        
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        });
        
        return true;
      } catch (supabaseError) {
        console.warn("Supabase logout warning:", supabaseError);
        
        toast({
          title: "Logout completed",
          description: "You have been logged out.",
        });
        
        return true; // Return true even on error to allow redirect
      }
    } catch (error: any) {
      console.error("General logout error:", error);
      
      // Force cleanup even on error
      clearAuthStateWrapper();
      const keysToRemove = [
        'isLoggedIn', 'userType', 'teacherId', 'studentId', 
        'teacherUsername', 'studentUsername', 'userEmail', 'isAdmin'
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
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
    
    // Set up auth state listener - simplified to prevent conflicts
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);

      // Only handle Supabase auth events if we don't have local auth
      const hasLocalAuth = localStorage.getItem("isLoggedIn") === "true";
      
      if (!hasLocalAuth) {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (newSession) await handleSession(newSession, updateAuthState, clearAuthStateWrapper);
        } else if (event === "SIGNED_OUT") {
          clearAuthStateWrapper();
        }
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
