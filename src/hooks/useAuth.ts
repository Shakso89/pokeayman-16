
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

type UserType = 'teacher' | 'student' | 'admin' | null;

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(localStorage.getItem('isLoggedIn') === 'true');
  const [userType, setUserType] = useState<UserType>(localStorage.getItem('userType') as UserType);
  const [userId, setUserId] = useState<string | null>(
    userType === 'teacher' ? localStorage.getItem('teacherId') : 
    userType === 'student' ? localStorage.getItem('studentId') : null
  );
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          return;
        }
        
        // If session exists and we don't have local storage set, update local storage
        if (session?.user && !isLoggedIn) {
          const { user } = session;
          const userData = user.user_metadata || {};
          
          if (userData.user_type === 'teacher' || user.email) {
            // This is a teacher
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userType', 'teacher');
            localStorage.setItem('teacherId', user.id);
            localStorage.setItem('teacherUsername', userData.username || user.email?.split('@')[0] || '');
            
            setIsLoggedIn(true);
            setUserType('teacher');
            setUserId(user.id);
          }
          
          // Note: Student authentication is handled separately in useStudentAuth
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { user } = session;
          const userData = user.user_metadata || {};
          
          if (userData.user_type === 'teacher' || user.email) {
            // This is a teacher
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userType', 'teacher');
            localStorage.setItem('teacherId', user.id);
            localStorage.setItem('teacherUsername', userData.username || user.email?.split('@')[0] || '');
            
            setIsLoggedIn(true);
            setUserType('teacher');
            setUserId(user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear auth state
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userType');
          localStorage.removeItem('teacherId');
          localStorage.removeItem('studentId');
          localStorage.removeItem('teacherUsername');
          localStorage.removeItem('studentDisplayName');
          localStorage.removeItem('isAdmin');
          
          setIsLoggedIn(false);
          setUserType(null);
          setUserId(null);
        }
      }
    );
    
    // Check initial auth state
    checkAuth();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const logout = async () => {
    try {
      setLoading(true);
      
      // For teacher users, sign out from Supabase Auth
      if (userType === 'teacher') {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
      }
      
      // For all users, clear local storage auth data
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      localStorage.removeItem('teacherId');
      localStorage.removeItem('studentId');
      localStorage.removeItem('teacherUsername');
      localStorage.removeItem('studentDisplayName');
      localStorage.removeItem('isAdmin');
      
      setIsLoggedIn(false);
      setUserType(null);
      setUserId(null);
      
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
    loading,
    logout
  };
};
