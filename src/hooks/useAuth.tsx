
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

  // Refresh auth state
  const refreshAuthState = async () => {
    console.log("Refreshing auth state...");
    setLoading(true);
    
    try {
      // First check localStorage for immediate feedback
      const hasLocalAuth = checkAuthState();
      
      // Then try to get session from Supabase
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (existingSession) {
        await handleSession(existingSession, updateAuthState, clearAuthStateWrapper);
      } else if (!hasLocalAuth) {
        // If no session and no localStorage, clear auth state
        clearAuthStateWrapper();
        console.log("No auth session found");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Keep the localStorage state if it exists
      if (!authState.isLoggedIn) {
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
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      localStorage.removeItem('teacherId');
      localStorage.removeItem('studentId');
      localStorage.removeItem('teacherUsername');
      localStorage.removeItem('studentUsername');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isAdmin');

      try {
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error("Supabase signout error:", error);
          // Don't throw error, just log it - logout should always succeed
        }

        console.log("Logout completed successfully");
        
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        });
        
        return true;
      } catch (supabaseError) {
        console.error("Supabase logout error:", supabaseError);
        
        toast({
          title: "Logout completed",
          description: "You have been logged out.",
        });
        
        return true; // Return true even on error to allow redirect
      }
    } catch (error: any) {
      console.error("General logout error:", error);
      
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
        if (newSession) await handleSession(newSession, updateAuthState, clearAuthStateWrapper);
      } else if (event === "SIGNED_OUT") {
        clearAuthStateWrapper();
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
