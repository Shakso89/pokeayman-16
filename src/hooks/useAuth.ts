import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { Session } from '@supabase/supabase-js';

type UserType = 'teacher' | 'student' | 'admin' | null;

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Centralized function to update auth state based on session
  const updateAuthState = useCallback((newSession: Session | null) => {
    if (newSession?.user) {
      const { user } = newSession;
      const userData = user.user_metadata || {};
      
      // Check for admin accounts
      const adminEmails = ['ayman.soliman.cc@gmail.com', 'admin@example.com', 'ayman.soliman.cc@gmial.com'];
      const isAdminEmail = adminEmails.includes(user.email?.toLowerCase() || '');
      
      if (userData.user_type === 'teacher' || user.email) {
        // This is a teacher
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', 'teacher');
        localStorage.setItem('teacherId', user.id);
        localStorage.setItem('teacherUsername', userData.username || user.email?.split('@')[0] || '');
        
        // Check for admin status
        if (isAdminEmail || userData.username === "Admin" || userData.username === "Ayman") {
          localStorage.setItem("isAdmin", "true");
        }
        
        setIsLoggedIn(true);
        setUserType('teacher');
        setUserId(user.id);
      } else if (userData.user_type === 'student') {
        // Handle student login if needed
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', 'student');
        localStorage.setItem('studentId', user.id);
        
        setIsLoggedIn(true);
        setUserType('student');
        setUserId(user.id);
      } else {
        // No recognized user type
        setIsLoggedIn(false);
        setUserType(null);
        setUserId(null);
      }
    } else {
      // No session, clear auth state
      setIsLoggedIn(false);
      setUserType(null);
      setUserId(null);
    }
    
    setSession(newSession);
  }, []);

  // Clear all auth data from localStorage
  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('studentId');
    localStorage.removeItem('teacherUsername');
    localStorage.removeItem('studentDisplayName');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('studentClassId');
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    let subscription: { data: { subscription: { unsubscribe: () => void } } };
    
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // First, check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          clearLocalStorage();
          setLoading(false);
          return;
        }
        
        // Update state with the existing session
        updateAuthState(sessionData.session);
        
        // Then, set up auth state change listener
        subscription = supabase.auth.onAuthStateChange((event, newSession) => {
          console.log("Auth state changed:", event);
          
          if (event === 'SIGNED_IN') {
            updateAuthState(newSession);
          } else if (event === 'SIGNED_OUT') {
            console.log("User signed out");
            // Clear auth state
            clearLocalStorage();
            updateAuthState(null);
          } else if (event === 'TOKEN_REFRESHED') {
            // Just update the session, keep other state
            setSession(newSession);
          }
        });
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearLocalStorage();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    
    initializeAuth();
    
    // Clean up subscription
    return () => {
      subscription?.data.subscription.unsubscribe?.();
    };
  }, [updateAuthState, clearLocalStorage]);
  
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // For all users, sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear local storage auth data
      clearLocalStorage();
      
      // Update state
      setIsLoggedIn(false);
      setUserType(null);
      setUserId(null);
      setSession(null);
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
      });
      
      return true;
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearLocalStorage]);
  
  return {
    isLoggedIn,
    userType,
    userId,
    session,
    loading,
    initialized,
    logout,
    updateAuthState
  };
};
