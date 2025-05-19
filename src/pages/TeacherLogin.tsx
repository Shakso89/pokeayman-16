
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

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
        // Fast check from localStorage first
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userType = localStorage.getItem("userType");
        
        if (isLoggedIn && userType === "teacher") {
          const isAdmin = localStorage.getItem("isAdmin") === "true";
          if (isAdmin) {
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate("/teacher-dashboard", { replace: true });
          }
          return;
        }
        
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

    // Set a timeout to ensure we don't get stuck in loading state
    const timer = setTimeout(() => {
      checkSession();
      
      // Add a fallback timeout in case the session check takes too long
      const fallbackTimer = setTimeout(() => {
        if (isMounted && checkingSession) {
          console.log("Session check timeout reached, showing login form");
          setCheckingSession(false);
        }
      }, 5000); // 5 second max wait time
      
      return () => clearTimeout(fallbackTimer);
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

  // Show loading state
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex flex-col items-center justify-center p-4">
        <img
          src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png"
          alt="PokéAyman Logo"
          className="h-24 w-auto mb-6"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.7))" }}
        />
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-xl flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-center">Checking login status...</h2>
          <p className="text-gray-500 mt-2 text-center">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout title="Teacher Login">
      {sessionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{sessionError}</AlertDescription>
        </Alert>
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
          {loginInProgress ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
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
