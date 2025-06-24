
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
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase logout error:', error);
        // Continue with local cleanup even if Supabase logout fails
      }

      // Clear all localStorage data
      const userType = localStorage.getItem("userType");
      localStorage.clear();
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      // Show success message
      toast({
        title: "Logged Out",
        description: "You have been securely logged out.",
      });
      
      console.log('Logout completed, redirecting to home...');
      
      // Navigate to appropriate login page based on user type
      if (userType === "teacher") {
        navigate('/teacher-login', { replace: true });
      } else if (userType === "student") {
        navigate('/student-login', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      
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
