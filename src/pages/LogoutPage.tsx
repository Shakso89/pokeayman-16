
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const LogoutPage: React.FC = () => {
  const { logout, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Sign out from Supabase Auth
        await supabase.auth.signOut();
        
        // Clear all local storage items related to authentication
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('teacherId');
        localStorage.removeItem('studentId');
        localStorage.removeItem('teacherUsername');
        localStorage.removeItem('studentDisplayName');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('studentClassId');
        
        // Call the logout function from useAuth to make sure everything is cleared
        await logout();
        
        // Show toast notification
        toast({
          title: "Logged out successfully",
          description: "You have been signed out of your account."
        });
        
        // Redirect to home page after logout
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout error",
          description: "There was an issue signing you out. Please try again.",
          variant: "destructive"
        });
        // Still redirect to home page
        navigate('/', { replace: true });
      }
    };
    
    performLogout();
  }, [navigate, logout]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Logging out...</h2>
      </div>
    </div>
  );
};

export default LogoutPage;
