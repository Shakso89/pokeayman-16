
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const userData = session.user.user_metadata || {};
        
        // If already logged in, redirect to dashboard
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("teacherId", session.user.id);
        localStorage.setItem("teacherUsername", userData.username || session.user.email?.split('@')[0] || '');
        
        // Check for admin status
        if (userData.username === "Admin" || userData.username === "Ayman") {
          localStorage.setItem("isAdmin", "true");
        }
        
        navigate("/teacher-dashboard");
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, [navigate]);
  
  const handleLogin = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError("");
      
      // Special case for admin login
      if ((username === "Admin" || username === "admin@pokeayman.com" || username === "Ayman") && 
          (password === "AdminAyman" || (username === "Ayman" && password === "AymanPassword"))) {
        
        // For admin, still use local authentication for now
        const adminUsername = username === "Ayman" ? "Ayman" : "Admin";
        
        toast({
          title: "Success!",
          description: `Welcome back, ${adminUsername}!`,
        });
        
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherUsername", adminUsername);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("teacherId", `admin-${adminUsername}-${Date.now().toString()}`);
        
        navigate("/admin-dashboard");
        return;
      }
      
      // Check if input is email (contains @)
      const isEmail = username.includes('@');
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: isEmail ? username : `${username}@placeholder.com`,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const userData = data.user.user_metadata || {};
        
        toast({
          title: "Success!",
          description: "Welcome back, Teacher!",
        });
        
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherUsername", userData.username || username);
        localStorage.setItem("teacherId", data.user.id);
        
        // Check for admin status
        if (userData.username === "Admin" || userData.username === "Ayman") {
          localStorage.setItem("isAdmin", "true");
          navigate("/admin-dashboard");
        } else {
          navigate("/teacher-dashboard");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <AuthLayout title="Teacher Login">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
        />
      </div>
      
      <LoginForm
        type="teacher"
        onLoginSuccess={handleLogin}
        error={error}
      />
    </AuthLayout>
  );
};

export default TeacherLogin;
