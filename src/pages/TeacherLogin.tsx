
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTeacherLogin } from "@/hooks/useTeacherLogin";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/utils/adminAuth";
import { AuthLayout } from "@/components/AuthLayout";
import AuthLoading from "@/components/auth/AuthLoading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const TeacherLogin: React.FC = () => {
  const navigate = useNavigate();
  const { handleLogin, error, loginInProgress } = useTeacherLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [sessionCheckTimeout, setSessionCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === "" || password.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    await handleLogin(username, password);
  };

  // Check if user is already logged in
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        // Get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        // If component unmounted, don't update state
        if (!isMounted) return;

        if (error) {
          console.error("Session check error:", error);
          setSessionError("Error checking your login status");
          setCheckingSession(false);
          return;
        } 
        
        // If session exists, handle routing
        if (session && session.user) {
          const email = session.user?.email?.toLowerCase();
          const isAdmin = isAdminEmail(email);
          
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("teacherUsername", session.user?.user_metadata?.username || "");

          if (isAdmin) {
            localStorage.setItem("isAdmin", "true");
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate("/teacher-dashboard", { replace: true });
          }
          return;
        }

        // If no session, clear localStorage and update state
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userType");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("teacherUsername");
        
        setCheckingSession(false);
      } catch (err) {
        console.error("Error checking session:", err);
        if (isMounted) {
          setCheckingSession(false);
          setSessionError("Failed to check login status");
        }
      }
    };

    // Use a timeout for the initial check to ensure UI renders first
    const timer = setTimeout(() => {
      checkSession();
    }, 1000);
    
    setSessionCheckTimeout(timer);

    // Clear timeout and set isMounted to false when component unmounts
    return () => {
      isMounted = false;
      if (sessionCheckTimeout) {
        clearTimeout(sessionCheckTimeout);
      }
      clearTimeout(timer);
    };
  }, [navigate]);

  // Already logged in check from localStorage (fast path)
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");

  // Show loading state
  if (checkingSession) {
    return <AuthLoading title="Teacher Login" />;
  }

  // If already logged in, redirect to appropriate dashboard
  if (isLoggedIn && userType === "teacher") {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    return <Navigate to={isAdmin ? "/admin-dashboard" : "/teacher-dashboard"} replace />;
  }

  return (
    <AuthLayout title="Teacher Login">
      {sessionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{sessionError}</p>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username or Email</Label>
          <Input
            id="username"
            placeholder="Enter your username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loginInProgress}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loginInProgress}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={loginInProgress}>
          {loginInProgress ? "Signing in..." : "Sign in"}
        </Button>

        <div className="text-center mt-4">
          <Button
            variant="link"
            className="text-sm text-blue-600"
            onClick={() => navigate("/teacher-signup")}
          >
            Don't have an account? Create one
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default TeacherLogin;
