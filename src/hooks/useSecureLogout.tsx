
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
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout Error",
          description: "There was an issue logging out. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Clear all localStorage data
      localStorage.clear();
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      // Show success message
      toast({
        title: "Logged Out",
        description: "You have been securely logged out.",
      });
      
      // Navigate to home page
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast({
        title: "Logout Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { secureLogout, isLoggingOut };
};
