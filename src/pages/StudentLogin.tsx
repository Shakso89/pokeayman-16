import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PokemonOrbit from "@/components/PokemonOrbit"; 
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { useAuth } from "@/hooks/useAuth";

const StudentLogin: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoading: studentAuthLoading, loginStudent } = useStudentAuth();
  const { isLoggedIn, userType, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if already logged in using Supabase or localStorage
  useEffect(() => {
    if (authLoading) return; // Wait until auth state is loaded
    
    if (isLoggedIn) {
      console.log("Already logged in as:", userType);
      
      // If logged in as teacher, redirect to teacher dashboard
      if (userType === 'teacher') {
        navigate('/teacher-dashboard');
        return;
      }
      
      // If logged in as student, redirect to student dashboard
      // Redirect to saved path or student dashboard
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        navigate('/student-dashboard');
      }
    }
  }, [isLoggedIn, userType, navigate, authLoading]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessing) return;
    setIsProcessing(true);
    
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
        localStorage.setItem('studentDisplayName', result.student.display_name || result.student.username);
        if (result.student.class_id) {
          localStorage.setItem('studentClassId', result.student.class_id);
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
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-center mt-4">Checking authentication status...</p>
        </div>
      </div>
    );
  }
  
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
                disabled={studentAuthLoading || isProcessing}
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
                disabled={studentAuthLoading || isProcessing}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={studentAuthLoading || isProcessing}
            >
              {studentAuthLoading || isProcessing ? "Logging in..." : "Login"}
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
