
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isTeacherActivated } from "@/utils/activationService";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, userType, loading } = useAuth();
  const isActivated = isTeacherActivated();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check for auth in Supabase on initial render
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        // If session doesn't exist but localStorage thinks we're logged in,
        // clear localStorage and redirect to login
        if (!data.session && isLoggedIn) {
          console.log("Session expired or invalid - redirecting to login");
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userType');
          localStorage.removeItem('teacherId');
          localStorage.removeItem('studentId');
          localStorage.removeItem('teacherUsername');
          localStorage.removeItem('studentDisplayName');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('studentClassId');
          
          const loginPath = userType === 'teacher' ? "/teacher-login" : "/student-login";
          navigate(loginPath, { replace: true });
        }
      } catch (error) {
        console.error("Auth status check failed:", error);
      }
    };
    
    if (isLoggedIn) {
      checkAuthStatus();
    }
  }, [navigate, isLoggedIn, userType]);

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle login check
  if (!isLoggedIn) {
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
            onClick={() => navigate("/contact")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t("contact-us")}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
