
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const LogoutPage: React.FC = () => {
  const { logout, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      await logout();
      // Redirect to home page after logout
      navigate('/', { replace: true });
    };
    
    performLogout();
  }, []);
  
  // Show a loading spinner while logging out
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
