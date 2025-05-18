
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const LogoutPage: React.FC = () => {
  const { logout, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        
        // Add a small delay before redirecting to ensure logout completes
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } catch (error) {
        console.error("Logout error:", error);
        // If logout fails, still redirect to home
        navigate('/', { replace: true });
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
      </div>
    </div>
  );
};

export default LogoutPage;
