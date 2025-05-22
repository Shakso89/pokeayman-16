
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const LogoutPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Only attempt logout once
    const performLogout = async () => {
      if (!isLoggingOut) return;
      
      try {
        setIsLoggingOut(false);
        console.log("Starting logout process...");
        
        // Call the logout function from the auth context
        await logout();
        
        console.log("Logout successful, redirecting to home...");
        // After a short delay, redirect to the home page
        timeoutId = setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } catch (error: unknown) {
        console.error("Logout error:", error);
        
        // Handle errors and show appropriate message
        if (error instanceof Error) {
          setLogoutError(error.message);
        } else {
          setLogoutError("An error occurred during logout");
        }
        
        // Even on error, redirect to home after a slight delay
        timeoutId = setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    };

    performLogout();

    // Clean up timeout when component unmounts
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [logout, navigate, isLoggingOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
      <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-xl">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Logging out...</h2>
        <p className="text-gray-500 mt-2">Please wait while we securely sign you out</p>

        {logoutError && (
          <div
            aria-live="polite"
            className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md"
          >
            {logoutError}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutPage;
