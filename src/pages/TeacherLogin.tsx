
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";
import { useTeacherLogin } from "@/hooks/useTeacherLogin";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { error, loginInProgress, handleLogin } = useTeacherLogin();
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check Supabase session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setSessionError("Error checking your login status");
        } else if (data.session) {
          // User is already logged in, redirect to dashboard
          const isAdmin = localStorage.getItem("isAdmin") === "true" || 
                         ["Ayman", "Admin"].includes(localStorage.getItem("teacherUsername") || "");
          
          navigate(isAdmin ? "/admin-dashboard" : "/teacher-dashboard");
          return;
        }
        
        // Also check localStorage as fallback
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userType = localStorage.getItem("userType");
        
        if (isLoggedIn && userType === "teacher") {
          const isAdmin = localStorage.getItem("isAdmin") === "true" || 
                         ["Ayman", "Admin"].includes(localStorage.getItem("teacherUsername") || "");
          
          navigate(isAdmin ? "/admin-dashboard" : "/teacher-dashboard");
          return;
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate]);
  
  if (checkingSession) {
    return (
      <AuthLayout title="Checking Login...">
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Checking your login status...</p>
        </div>
      </AuthLayout>
    );
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
