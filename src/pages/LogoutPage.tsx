
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const LogoutPage: React.FC = () => {
  const { logout, loading } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        const success = await logout();
        
        // Add a small delay before redirecting to ensure logout completes
        setTimeout(() => {
          navigate('/', { replace: true });
        }, success ? 500 : 0);
      } catch (error: any) {
        console.error("Logout error:", error);
        setLogoutError(error?.message || "An error occurred during logout");
        
        // If logout fails, still redirect to home after a longer delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    };
    
    performLogout();
  }, [logout, navigate]);
  
  // Show a loading spinner while logging out
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
      <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-xl">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Logging out...</h2>
        <p className="text-gray-500 mt-2">Please wait while we securely sign you out</p>
        
        {logoutError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {logoutError}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutPage;
