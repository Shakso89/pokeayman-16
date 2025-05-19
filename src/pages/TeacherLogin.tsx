
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherLogin } from "@/hooks/useTeacherLogin";
import AuthLoading from "@/components/auth/AuthLoading";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isAdmin, loading, userType } = useAuth();
  const { error, loginInProgress, handleLogin } = useTeacherLogin();

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

  if (loading && !loginInProgress) {
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

      <LoginForm
        type="teacher"
        onLoginSuccess={handleLogin}
        error={error}
      />
    </AuthLayout>
  );
};

export default TeacherLogin;
