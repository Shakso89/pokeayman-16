
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PokemonOrbit from "@/components/PokemonOrbit";
import { toast } from "@/hooks/use-toast";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading: studentAuthLoading, loginStudent } = useStudentAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userType = localStorage.getItem("userType");
        
        if (isLoggedIn && userType === "student") {
          navigate("/student-dashboard", { replace: true });
          return;
        }

        // Quick session check with timeout
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
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userType", "student");
            navigate("/student-dashboard", { replace: true });
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!usernameOrEmail || !password) {
      toast({
        title: "Error",
        description: "Please enter your username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Attempting student login with username:", usernameOrEmail);
      const result = await loginStudent(usernameOrEmail, password);

      if (result.success) {
        console.log("Login successful, redirecting to dashboard");
        navigate("/student-dashboard", { replace: true });
      } else {
        toast({
          title: "Login Error",
          description: result.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
        <img
          src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png"
          alt="PokéAyman Logo"
          className="h-24 w-auto mb-6"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.7))" }}
        />
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-xl flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
          <h2 className="text-xl font-semibold text-center">Checking login status...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <PokemonOrbit count={8} />
      </div>

      <div className="absolute top-10 flex flex-col items-center z-10 mb-8">
        <img
          src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png"
          alt="PokéAyman Logo"
          className="h-24 w-auto mb-2"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.7))" }}
        />
      </div>

      <Card className="w-full max-w-md z-10 mt-20 backdrop-blur-sm bg-white/90 border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Student Login</CardTitle>
          <CardDescription>Enter your login details to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="usernameOrEmail" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="usernameOrEmail"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Enter your username"
                disabled={isProcessing || studentAuthLoading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isProcessing || studentAuthLoading}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isProcessing || studentAuthLoading}
            >
              {isProcessing || studentAuthLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="link"
            className="px-0 text-blue-600 hover:text-blue-800"
            onClick={() => navigate("/teacher-login")}
          >
            Are you a teacher? Login here
          </Button>
          <Button
            variant="link"
            className="px-0 text-gray-600 hover:text-gray-800"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentLogin;
