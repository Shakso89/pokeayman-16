import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { Session } from '@supabase/supabase-js';
import { AuthState } from './auth/types';
import { handleSession } from './auth/sessionHandler';
import { clearAuthState, loadFromLocalStorage } from './auth/authStateManagement';

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
        await handleSession(existingSession, updateAuthState, () => clearAuthState(updateAuthState));
      } else {
        // If no session and localStorage failed, clear auth state
        if (!loadFromLocalStorage(updateAuthState)) {
          clearAuthState(updateAuthState);
          console.log("No auth session found");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Keep the localStorage state if it exists
      if (!authState.isLoggedIn) {
        clearAuthState(updateAuthState);
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
      clearAuthState(updateAuthState);

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
      clearAuthState(updateAuthState);
      
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
        if (newSession) await handleSession(newSession, updateAuthState, () => clearAuthState(updateAuthState));
      } else if (event === "SIGNED_OUT") {
        clearAuthState(updateAuthState);
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
