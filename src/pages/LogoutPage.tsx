
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LogoutPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Prevent multiple logout attempts
    if (hasStarted) return;
    
    setHasStarted(true);
    
    const performLogout = async () => {
      try {
        console.log("Starting logout process...");
        
        // Force clear localStorage immediately
        localStorage.clear();
        
        // Call the logout function
        await logout();
        
        console.log("Logout completed, redirecting to home");
        
        // Redirect to home
        navigate('/', { replace: true });
      } catch (error: unknown) {
        console.error("Logout error:", error);
        
        // Force clear localStorage even on error
        localStorage.clear();
        
        // Still redirect to home
        navigate('/', { replace: true });
      }
    };

    // Add a small delay to prevent race conditions
    const timer = setTimeout(performLogout, 100);
    
    return () => clearTimeout(timer);
  }, [logout, navigate, hasStarted]);

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
      </motion.div>
    </motion.div>
  );
};

export default LogoutPage;
