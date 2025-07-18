
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isTeacherActivated } from "@/utils/activationService";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: "teacher" | "student" | "admin" | "any";
  allowAdminOverride?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType = "any",
  allowAdminOverride = true
}) => {
  const { isLoggedIn, userType, loading, isAdmin } = useAuth();
  const isActivated = isTeacherActivated();
  const { t } = useTranslation();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Add a slight delay to prevent flickering during auth check
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialCheckDone(true);
    }, 100); // Reduced delay for better UX
    
    return () => clearTimeout(timer);
  }, []);

  // Determine if user has access based on type requirements
  const hasAccess = (): boolean => {
    if (!isLoggedIn) {
      console.log("ProtectedRoute: User not logged in");
      return false;
    }
    
    // Admin override check
    if (allowAdminOverride && isAdmin) {
      console.log("ProtectedRoute: Admin override allowed");
      return true;
    }
    
    // Any user type allowed
    if (requiredUserType === "any") {
      console.log("ProtectedRoute: Any user type allowed");
      return true;
    }
    
    // Specific user type required
    if (requiredUserType === userType) {
      console.log("ProtectedRoute: User type matches requirement");
      return true;
    }
    
    console.log("ProtectedRoute: Access denied", { requiredUserType, userType, isAdmin });
    return false;
  };

  // Get appropriate login route based on context
  const getLoginRoute = (): string => {
    // From path context, determine which login page is most appropriate
    if (location.pathname.includes('student')) {
      return '/student-login';
    }
    return '/teacher-login';
  };

  // If still loading auth state, show loading indicator
  if (loading || !initialCheckDone) {
    console.log("ProtectedRoute: Loading auth state...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log("ProtectedRoute: Auth check complete", { 
    isLoggedIn, 
    userType, 
    isAdmin, 
    requiredUserType,
    path: location.pathname,
    hasAccess: hasAccess()
  });

  // Handle login check
  if (!isLoggedIn) {
    console.log("ProtectedRoute: User not logged in, redirecting to", getLoginRoute());
    // Store the attempted URL to redirect back after login
    if (location.pathname !== '/teacher-login' && location.pathname !== '/student-login') {
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
    }
    
    return <Navigate to={getLoginRoute()} replace />;
  }

  // Check if user has required access type
  if (!hasAccess()) {
    console.log("ProtectedRoute: User doesn't have access");
    // For admin trying to access student routes, allow it but with warning
    if (isAdmin && requiredUserType === "student") {
      console.log("ProtectedRoute: Admin accessing student route - allowing with override");
      // Clear redirect info for admin override
      if (sessionStorage.getItem('redirectAfterLogin')) {
        sessionStorage.removeItem('redirectAfterLogin');
      }
      return <>{children}</>;
    }
    
    // Redirect to appropriate dashboard
    const dashboardRoute = userType === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
    console.log("ProtectedRoute: Redirecting to", dashboardRoute);
    return <Navigate to={dashboardRoute} replace />;
  }

  // For teachers who are frozen (not activated), render a simple placeholder
  if (userType === "teacher" && !isActivated && !(allowAdminOverride && isAdmin)) {
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

  console.log("ProtectedRoute: Access granted, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
