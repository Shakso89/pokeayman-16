
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PokemonOrbit from "@/components/PokemonOrbit"; 
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentLogin: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check if already logged in using Supabase
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if user is a student
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (student) {
          navigate("/student-dashboard");
        }
      }
    };
    
    checkAuthStatus();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!usernameOrEmail || !password) {
        toast({
          title: "Error",
          description: "Please enter your username/email and password",
          variant: "destructive",
        });
        return;
      }
      
      // First, check if the username/email and password match in the students table
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
        .eq('password', password)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (!student) {
        toast({
          title: "Login Failed",
          description: "Invalid username/email or password",
          variant: "destructive",
        });
        return;
      }
      
      // Update last login time
      await supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('id', student.id);
      
      // Store student session
      await supabase.auth.signInWithPassword({
        email: student.email || `${student.username}@pokeayman.com`,
        password: student.password
      });
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${student.display_name || student.username}`,
      });
      
      navigate("/student-dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                Username or Email
              </label>
              <Input
                id="usernameOrEmail"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Enter your username or email"
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
