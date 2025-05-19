
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherLogin } from "@/hooks/useTeacherLogin";
import AuthLoading from "@/components/auth/AuthLoading";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isAdmin, loading, userType } = useAuth();
  const { error, loginInProgress, handleLogin } = useTeacherLogin();
  const [showLoading, setShowLoading] = useState(true);
  const [forceShowForm, setForceShowForm] = useState(false);

  // Add a timeout to handle potential stuck loading states
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 2000); // Show form after 2 seconds even if loading is still true
      
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [loading]);

  // After 5 seconds, force show the form regardless of state
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShowForm(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading || loginInProgress) return;

    if (isLoggedIn) {
      const redirect = sessionStorage.getItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterLogin");

      console.log("User is logged in:", { userType, isAdmin });
      if (userType === "student") {
        navigate("/student-dashboard");
      } else if (isAdmin) {
        navigate(redirect || "/admin-dashboard");
      } else {
        navigate(redirect || "/teacher-dashboard");
      }
    }
  }, [isLoggedIn, isAdmin, userType, navigate, loginInProgress, loading]);

  // Show content after timeout even if loading is still true
  if (loading && showLoading && !loginInProgress && !forceShowForm) {
    return <AuthLoading title="Teacher Login" />;
  }

  return (
    <AuthLayout title="Teacher Login">
      <div className="flex justify-center mb-8">
        <img
          src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png"
          alt="PokéAyman Logo"
          className="h-24 w-auto"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))" }}
        />
      </div>

      {loading && !showLoading && !forceShowForm ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <LoginForm
            type="teacher"
            onLoginSuccess={handleLogin}
            error={error}
          />
          {loading && (
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Having trouble logging in?</p>
              <Button 
                variant="link" 
                onClick={() => setForceShowForm(true)}
                className="p-0 h-auto text-blue-500"
              >
                Refresh the page
              </Button>
            </div>
          )}
        </>
      )}
    </AuthLayout>
  );
};

export default TeacherLogin;
