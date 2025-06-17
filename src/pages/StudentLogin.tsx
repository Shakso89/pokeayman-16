
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PokemonOrbit from "@/components/PokemonOrbit";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from "bcryptjs";

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // Check if this is a student
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (studentData) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userType", "student");
            localStorage.setItem("studentId", studentData.id);
            localStorage.setItem("studentName", studentData.display_name || studentData.username);
            localStorage.setItem("studentDisplayName", studentData.display_name || studentData.username);
            navigate("/student-dashboard", { replace: true });
            return;
          }
        }
      } catch (err) {
        console.log("Session check completed with error:", err);
      }
      
      setCheckingSession(false);
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter your username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get student data from database
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !student) {
        toast({
          title: "Login Error",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return;
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, student.password_hash);

      if (!passwordValid) {
        toast({
          title: "Login Error",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return;
      }

      // Sign in with Supabase auth using dummy email
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${username}@student.local`,
        password: password,
      });

      if (authError) {
        console.error("Auth error:", authError);
        // Continue with login even if auth fails, as we've verified credentials
      }

      // Update last login
      await supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('id', student.id);

      // Set session data
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "student");
      localStorage.setItem("studentId", student.id);
      localStorage.setItem("studentName", student.display_name || student.username);
      localStorage.setItem("studentDisplayName", student.display_name || student.username);

      toast({
        title: "Success!",
        description: `Welcome back, ${student.display_name || student.username}!`,
      });

      navigate("/student-dashboard", { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-4">
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
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
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

      <Card className="w-full max-w-md z-10 mt-20 backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Student Login</CardTitle>
          <CardDescription>Enter your login details to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
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
        <CardFooter className="flex justify-center space-x-4">
          <Button
            variant="link"
            className="px-0 text-blue-600"
            onClick={() => navigate("/student-signup")}
          >
            Don't have an account? Sign up
          </Button>
          <Button
            variant="link"
            className="px-0 text-blue-600"
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
