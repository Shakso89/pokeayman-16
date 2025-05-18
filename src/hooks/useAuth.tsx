
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
      (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession) {
            handleSession(newSession);
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
    try {
      const currentUser = newSession.user;
      setSession(newSession);
      setUser(currentUser);
      
      if (currentUser) {
        const userData = currentUser.user_metadata || {};
        // Check for admin status by email
        const adminEmails = ['ayman.soliman.cc@gmail.com', 'admin@pokeayman.com', 'admin@example.com'];
        const isAdminEmail = adminEmails.includes(currentUser.email?.toLowerCase() || '');
        const isAdminUser = isAdminEmail || userData.username === "Admin" || userData.username === "Ayman";
        
        // Get user type from metadata or determine from database
        const userTypeFromMeta = userData.user_type as UserType;
        
        if (userTypeFromMeta === 'student') {
          // This is explicitly marked as a student account
          setupStudentAuth(currentUser.id, userData);
        } else {
          // Try to find if this is a student account first if type not specified
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();
            
          if (studentData) {
            // This is a student account
            setupStudentAuth(currentUser.id, studentData);
          } else {
            // Assume teacher account if not found as student
            setupTeacherAuth(currentUser.id, userData, isAdminUser);
          }
        }
      }
    } catch (error) {
      console.error("Error in handleSession:", error);
      // If there's an error, still try to process with available data
      const sessionUser = newSession.user;
      if (sessionUser) {
        setIsLoggedIn(true);
        setUserType('teacher'); // Default to teacher if error
        setUserId(sessionUser.id);
      }
    }
  };
  
  // Helper to set up student authentication
  const setupStudentAuth = (id: string, data: any) => {
    setIsLoggedIn(true);
    setUserType('student');
    setUserId(id);
    setIsAdmin(false);
    
    // Update localStorage for compatibility with existing code
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', 'student');
    localStorage.setItem('studentId', id);
    localStorage.setItem('studentDisplayName', data.display_name || data.username || '');
    if (data.class_id) {
      localStorage.setItem('studentClassId', data.class_id);
    }
  };
  
  // Helper to set up teacher authentication
  const setupTeacherAuth = (id: string, userData: any, isAdminUser: boolean) => {
    setIsLoggedIn(true);
    setUserType('teacher');
    setUserId(id);
    setIsAdmin(isAdminUser);
    
    // Update localStorage for compatibility with existing code
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', 'teacher');
    localStorage.setItem('teacherId', id);
    localStorage.setItem('teacherUsername', userData.username || userData.email?.split('@')[0] || '');
    
    if (isAdminUser) {
      localStorage.setItem('isAdmin', 'true');
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
