
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PokemonOrbit from "@/components/PokemonOrbit"; 
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStudentAuth } from "@/hooks/useStudentAuth";

const StudentLogin: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoading, loginStudent } = useStudentAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if already logged in using Supabase or localStorage
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check Supabase session first
      if (session) {
        // Check if user is a student
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (student) {
          navigate("/student-dashboard");
          return;
        }
      }
      
      // If no Supabase session, check localStorage
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userType = localStorage.getItem('userType');
      
      if (isLoggedIn && userType === 'student') {
        // Redirect to saved path or student dashboard
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate('/student-dashboard');
        }
      }
    };
    
    checkAuthStatus();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!usernameOrEmail || !password) {
        toast({
          title: "Error",
          description: "Please enter your username and password",
          variant: "destructive",
        });
        return;
      }
      
      const result = await loginStudent(usernameOrEmail, password);
      
      if (result.success && result.student) {
        // Store student info in local storage for now (will be replaced with proper session management)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', 'student');
        localStorage.setItem('studentId', result.student.id);
        localStorage.setItem('studentName', result.student.display_name || result.student.username);
        if (result.student.class_id) {
          localStorage.setItem('studentClassId', result.student.class_id);
        }
        
        // Try to sign in with Supabase Auth
        // For now, we'll use a generated email if none is provided
        const generatedEmail = `${result.student.username}@pokeayman.com`;
        
        try {
          await supabase.auth.signInWithPassword({
            email: generatedEmail,
            password: password
          });
        } catch (authError) {
          console.error("Supabase auth error:", authError);
          // Continue anyway since we're using local storage for now
        }
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${result.student.display_name || result.student.username}`,
        });
        
        // Check for redirect path or go to dashboard
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate("/student-dashboard");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Pokemon background */}
      <div className="absolute inset-0 pointer-events-none">
        <PokemonOrbit count={8} />
      </div>
      
      <div className="flex flex-col items-center mb-8 absolute top-10">
        <img 
          src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png" 
          alt="PokéAyman Logo" 
          className="h-24 w-auto mb-2"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.7))' }}
        />
      </div>
      
      <Card className="w-full max-w-md shadow-xl relative z-10 backdrop-blur-sm bg-white/80 border-white/20 mt-20">
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
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
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
