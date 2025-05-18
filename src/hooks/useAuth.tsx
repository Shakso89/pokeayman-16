
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { Session, User } from '@supabase/supabase-js';

type UserType = 'teacher' | 'student' | 'admin' | null;

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Check authentication status on mount
  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession) {
            await handleSession(newSession);
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuthState();
        }
      }
    );
    
    // Then check for existing session
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          await handleSession(existingSession);
        } else {
          // No session found, check localStorage as fallback for backward compatibility
          const localIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
          const localUserType = localStorage.getItem('userType') as UserType;
          
          if (localIsLoggedIn && localUserType) {
            setIsLoggedIn(true);
            setUserType(localUserType);
            setUserId(localStorage.getItem(localUserType === 'teacher' ? 'teacherId' : 'studentId'));
            setIsAdmin(localStorage.getItem('isAdmin') === 'true');
          } else {
            clearAuthState();
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to handle session data
  const handleSession = async (newSession: Session) => {
    const newUser = newSession.user;
    setSession(newSession);
    setUser(newUser);
    
    if (newUser) {
      const userData = newUser.user_metadata || {};
      // Check for admin status by email
      const adminEmails = ['ayman.soliman.cc@gmail.com', 'admin@pokeayman.com', 'admin@example.com'];
      const isAdminEmail = adminEmails.includes(newUser.email?.toLowerCase() || '');
      const isAdminUser = isAdminEmail || userData.username === "Admin" || userData.username === "Ayman";
      
      setIsLoggedIn(true);
      setUserType('teacher'); // Assuming Supabase auth is only for teachers for now
      setUserId(newUser.id);
      setIsAdmin(isAdminUser);
      
      // Update localStorage for compatibility with existing code
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userType', 'teacher');
      localStorage.setItem('teacherId', newUser.id);
      localStorage.setItem('teacherUsername', userData.username || newUser.email?.split('@')[0] || '');
      
      if (isAdminUser) {
        localStorage.setItem('isAdmin', 'true');
      }
    }
  };
  
  // Helper function to clear auth state
  const clearAuthState = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setUserId(null);
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    
    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('studentId');
    localStorage.removeItem('teacherUsername');
    localStorage.removeItem('studentDisplayName');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('studentClassId');
  };
  
  const logout = async () => {
    try {
      setLoading(true);
      
      // For all users, sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      clearAuthState();
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return {
    isLoggedIn,
    userType,
    userId,
    session,
    user,
    loading,
    isAdmin,
    logout
  };
};
