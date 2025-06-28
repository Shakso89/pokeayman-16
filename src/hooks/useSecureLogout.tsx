
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSecureLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const secureLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      console.log('Starting secure logout process...');
      
      // Store user type before clearing
      const userType = localStorage.getItem("userType");
      
      // Clear all localStorage data immediately
      const keysToRemove = [
        'isLoggedIn', 'userType', 'teacherId', 'studentId', 
        'teacherUsername', 'studentUsername', 'userEmail', 'isAdmin'
      ];
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      try {
        // Sign out from Supabase - don't let this block the logout
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.warn('Supabase logout warning:', error);
          // Continue with local cleanup even if Supabase logout fails
        }
      } catch (supabaseError) {
        console.warn('Supabase logout error:', supabaseError);
        // Continue with logout process
      }

      // Show success message
      toast({
        title: "Logged Out",
        description: "You have been securely logged out.",
      });
      
      console.log('Logout completed, redirecting...');
      
      // Navigate to appropriate login page based on previous user type
      const redirectPath = userType === "teacher" ? '/teacher-login' : 
                          userType === "student" ? '/student-login' : '/';
      
      navigate(redirectPath, { replace: true });
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      
      // Force cleanup even on error
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Logout Error",
        description: "An error occurred, but you have been logged out.",
        variant: "destructive",
      });
      
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { secureLogout, isLoggingOut };
};
