
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTeacherLogin } from "@/hooks/useTeacherLogin";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/utils/adminAuth";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const TeacherLogin: React.FC = () => {
  const navigate = useNavigate();
  const { handleLogin, error, loginInProgress } = useTeacherLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

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
    
    try {
      await handleLogin(username, password);
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Quick localStorage check first
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userType = localStorage.getItem("userType");
        
        if (isLoggedIn && userType === "teacher") {
          const isAdmin = localStorage.getItem("isAdmin") === "true";
          navigate(isAdmin ? "/admin-dashboard" : "/teacher-dashboard", { replace: true });
          return;
        }
        
        // Check Supabase session with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Session check timeout")), 3000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        try {
          const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
          
          if (error) {
            console.error("Session check error:", error);
            setCheckingSession(false);
            return;
          }
          
          if (session && session.user) {
            const email = session.user?.email?.toLowerCase();
            const isAdmin = isAdminEmail(email);
            
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userType", "teacher");
            localStorage.setItem("teacherUsername", session.user?.user_metadata?.username || email?.split('@')[0] || "");
            localStorage.setItem("userEmail", email || "");

            if (isAdmin) {
              localStorage.setItem("isAdmin", "true");
              navigate("/admin-dashboard", { replace: true });
            } else {
              localStorage.setItem("isAdmin", "false");
              navigate("/teacher-dashboard", { replace: true });
            }
            return;
          }
        } catch (timeoutError) {
          console.log("Session check timed out, proceeding to login");
        }
      } catch (err) {
        console.log("Session check error:", err);
      }
      
      setCheckingSession(false);
    };

    checkSession();
  }, [navigate]);

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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <AuthLayout title="Teacher Login">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username or Email</Label>
                <Input
                  id="username"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loginInProgress}
                  className="w-full"
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
                  className="w-full"
                />
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

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
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => navigate("/teacher-signup")}
                  type="button"
                >
                  Don't have an account? Create one
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => navigate("/")}
                  type="button"
                >
                  Back to Home
                </Button>
              </div>
            </form>
          </AuthLayout>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
