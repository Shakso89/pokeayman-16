
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";
import { useTeacherLogin } from "@/hooks/useTeacherLogin";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAdminEmail } from "@/utils/adminAuth";
import AuthLoading from "@/components/auth/AuthLoading";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { error, loginInProgress, handleLogin } = useTeacherLogin();
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  
  // Check if user is already logged in
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        // Check Supabase session
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error("Session check error:", error);
          setSessionError("Error checking your login status");
        } else if (data.session) {
          // User is already logged in, redirect to dashboard
          const email = data.session.user?.email?.toLowerCase();
          const isAdmin = email ? isAdminEmail(email) : false;
          const localAdmin = localStorage.getItem("isAdmin") === "true" || 
                           ["Ayman", "Admin"].includes(localStorage.getItem("teacherUsername") || "");
          
          // If email is admin or localStorage says it's admin, redirect to admin dashboard
          if (isAdmin || localAdmin) {
            if (isAdmin && !localAdmin) {
              // Ensure localStorage is updated for admin emails
              localStorage.setItem("isAdmin", "true");
            }
            navigate("/admin-dashboard");
          } else {
            navigate("/teacher-dashboard");
          }
          return;
        }
        
        // Fallback to localStorage check
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userType = localStorage.getItem("userType");
        
        if (!isMounted) return;
        
        if (isLoggedIn && userType === "teacher") {
          const isAdmin = localStorage.getItem("isAdmin") === "true" || 
                         ["Ayman", "Admin"].includes(localStorage.getItem("teacherUsername") || "");
          
          navigate(isAdmin ? "/admin-dashboard" : "/teacher-dashboard");
          return;
        }
        
        setCheckingSession(false);
      } catch (err) {
        console.error("Error checking session:", err);
        if (isMounted) {
          setCheckingSession(false);
          setSessionError("Failed to check login status");
        }
      }
    };
    
    // Small timeout to avoid flickering
    const timer = setTimeout(() => {
      checkSession();
    }, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigate]);
  
  if (checkingSession) {
    return <AuthLoading title="Checking Login..." />;
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

      {sessionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{sessionError}</AlertDescription>
        </Alert>
      )}

      <LoginForm
        type="teacher"
        onLoginSuccess={handleLogin}
        error={error}
      />
    </AuthLayout>
  );
};

export default TeacherLogin;
