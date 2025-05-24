import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LogoutPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [logoutComplete, setLogoutComplete] = useState(false);

  useEffect(() => {
    // Prevent multiple logout attempts
    if (logoutComplete) return;
    
    const performLogout = async () => {
      try {
        console.log("Starting logout process...");
        
        // Call the logout function from the auth context
        const success = await logout();
        
        if (success) {
          console.log("Logout successful");
          setLogoutComplete(true);
          
          // Force clear any remaining localStorage items
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userType");
          localStorage.removeItem("teacherId");
          localStorage.removeItem("studentId");
          localStorage.removeItem("teacherUsername");
          localStorage.removeItem("studentDisplayName");
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("studentClassId");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("studentName");
          localStorage.removeItem("studentSchoolId");
          
          // Redirect to home after a short delay
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          throw new Error("Logout failed");
        }
      } catch (error: unknown) {
        console.error("Logout error:", error);
        
        // Force clear localStorage even on error
        localStorage.clear();
        
        if (error instanceof Error) {
          setLogoutError(error.message);
        } else {
          setLogoutError("An error occurred during logout");
        }
        
        // Still redirect to home after error
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    };

    performLogout();
  }, [logout, navigate, logoutComplete]);

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300, 
          damping: 20,
          delay: 0.2 
        }}
      >
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
          }}
          className="mx-auto mb-4"
        >
          <Loader2 className="h-12 w-12 text-blue-500" />
        </motion.div>
        
        <motion.h2 
          className="text-xl font-semibold"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Logging out...
        </motion.h2>
        
        <motion.p 
          className="text-gray-500 mt-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Please wait while we securely sign you out
        </motion.p>

        {logoutError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            aria-live="polite"
            className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md"
          >
            {logoutError}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LogoutPage;
