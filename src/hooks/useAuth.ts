
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { Session } from '@supabase/supabase-js';

type UserType = 'teacher' | 'student' | 'admin' | null;

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(localStorage.getItem('isLoggedIn') === 'true');
  const [userType, setUserType] = useState<UserType>(localStorage.getItem('userType') as UserType);
  const [userId, setUserId] = useState<string | null>(
    userType === 'teacher' ? localStorage.getItem('teacherId') : 
    userType === 'student' ? localStorage.getItem('studentId') : null
  );
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    // First, set up auth state change listener to avoid race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Only use synchronous state updates here
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession) {
          const { user } = newSession;
          const userData = user.user_metadata || {};
          
          if (userData.user_type === 'teacher' || user.email) {
            // This is a teacher
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userType', 'teacher');
            localStorage.setItem('teacherId', user.id);
            localStorage.setItem('teacherUsername', userData.username || user.email?.split('@')[0] || '');
            
            // Check for admin status
            if (userData.username === "Admin" || userData.username === "Ayman") {
              localStorage.setItem("isAdmin", "true");
            }
            
            setIsLoggedIn(true);
            setUserType('teacher');
            setUserId(user.id);
            
            // Use setTimeout to avoid calling Supabase inside the callback
            setTimeout(() => {
              // Initialize teacher credits if needed, but don't block the auth flow
              console.log("Checking teacher credits for", user.id);
            }, 0);
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
          setSession(null);
        }
      }
    );
    
    // Then check for existing session
    const checkAuth = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setLoading(false);
          return;
        }
        
        // Update state with the session
        setSession(existingSession);
        
        // If session exists and we don't have local storage set, update local storage
        if (existingSession?.user && !isLoggedIn) {
          const { user } = existingSession;
          const userData = user.user_metadata || {};
          
          if (userData.user_type === 'teacher' || user.email) {
            // This is a teacher
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userType', 'teacher');
            localStorage.setItem('teacherId', user.id);
            localStorage.setItem('teacherUsername', userData.username || user.email?.split('@')[0] || '');
            
            if (userData.username === "Admin" || userData.username === "Ayman") {
              localStorage.setItem("isAdmin", "true");
            }
            
            setIsLoggedIn(true);
            setUserType('teacher');
            setUserId(user.id);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
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
      
      // For all users, sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear local storage auth data
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
      setSession(null);
      
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
    loading,
    logout
  };
};
