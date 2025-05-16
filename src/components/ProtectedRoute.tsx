
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isTeacherActivated } from "@/utils/activationService";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, userType, loading, isAdmin } = useAuth();
  const isActivated = isTeacherActivated();
  const { t } = useTranslation();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Add a slight delay to prevent flickering during auth check
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialCheckDone(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // If still loading auth state, show loading indicator
  if (loading || !initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle login check
  if (!isLoggedIn) {
    // Store the attempted URL to redirect back after login
    if (location.pathname !== '/teacher-login' && location.pathname !== '/student-login') {
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
    }
    return <Navigate to={userType === "teacher" ? "/teacher-login" : "/student-login"} replace />;
  }

  // For teachers who are frozen (not activated), render a simple placeholder
  // Admin users are exempt from activation check
  if (userType === "teacher" && !isActivated && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 flex items-center justify-center p-4">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">{t("account-frozen")}</h2>
          <p className="mb-6">{t("account-frozen-message")}</p>
          <Button 
            onClick={() => window.location.href = "/contact"}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t("contact-us")}
          </Button>
        </div>
      </div>
    );
  }

  // Clear redirect info after successful login and protection check
  if (sessionStorage.getItem('redirectAfterLogin')) {
    sessionStorage.removeItem('redirectAfterLogin');
  }

  return <>{children}</>;
};

export default ProtectedRoute;
