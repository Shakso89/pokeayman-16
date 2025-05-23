
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { AuthState } from './auth/types';
import { 
  clearAuthState as clearState, 
  loadFromLocalStorage 
} from './auth/authStateManagement';
import { handleSession } from './auth/sessionHandler';

// Initial auth state
const initialAuthState: AuthState = {
  isLoggedIn: false,
  userType: null,
  userId: null,
  session: null,
  user: null,
  isAdmin: false
};

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Update auth state with new values
  const updateAuthState = (newState: Partial<AuthState>) => {
    setAuthState(prevState => ({ ...prevState, ...newState }));
  };

  // Clear auth state wrapper
  const clearAuthState = () => clearState(updateAuthState);

  // Refresh auth state
  const refreshAuthState = async () => {
    console.log("Refreshing auth state...");
    setLoading(true);
    
    try {
      // First load from localStorage for immediate feedback
      loadFromLocalStorage(updateAuthState);
      
      // Then try to get session from Supabase
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (existingSession) {
        await handleSession(existingSession, updateAuthState, clearAuthState);
      } else {
        // If no session and localStorage failed, clear auth state
        if (!loadFromLocalStorage(updateAuthState)) {
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

  // Logout function - improved to better handle errors and clean up state
  const logout = async () => {
    try {
      console.log("Attempting to log out...");
      setLoading(true);

      // Clear the local state first for immediate UI response
      clearAuthState();

      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signOut error:", error);
        // Even if there's an error, we've already cleared local state
      }

      console.log("Logout completed");
      
      // Show success toast
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      // Remove any auth-related items from localStorage
      localStorage.removeItem("authState");
      localStorage.removeItem("userType");
      localStorage.removeItem("userId");
      localStorage.removeItem("teacherId");
      localStorage.removeItem("teacherUsername");
      localStorage.removeItem("studentId");
      localStorage.removeItem("studentUsername");
      
      return true;
    } catch (error: any) {
      console.error("Logout error:", error);
      
      // We already cleared local state, so just show a message
      toast({
        title: "Logged out",
        description: "You have been logged out, but there may have been a syncing issue.",
      });
      
      // Return true anyway since local state is cleared
      return true;
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
        if (newSession) await handleSession(newSession, updateAuthState, clearAuthState);
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
