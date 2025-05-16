import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const [error, setError] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);
  
  // Check if already logged in
  useEffect(() => {
    if (isLoggedIn && !loginInProgress) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else if (isAdmin) {
        navigate("/admin-dashboard");
      } else {
        navigate("/teacher-dashboard");
      }
    }
  }, [isLoggedIn, isAdmin, navigate, loginInProgress]);
  
  const handleLogin = async (username: string, password: string) => {
    try {
      setLoginInProgress(true);
      setError("");
      
      // Special case for admin login
      if ((username === "Admin" || username === "admin@pokeayman.com" || username === "Ayman" || 
           username === "ayman.soliman.cc@gmail.com") && 
          (password === "AdminAyman" || (username === "Ayman" && password === "AymanPassword"))) {
        
        // For admin users, try to sign in with Supabase first using email if provided
        if (username === "ayman.soliman.cc@gmail.com" || username === "admin@pokeayman.com") {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: username,
              password: password
            });
            
            if (error) {
              console.error("Admin Supabase login error:", error);
              // Fall back to local auth if Supabase fails
            } else if (data.user) {
              toast({
                title: "Success!",
                description: `Welcome back, Admin!`,
              });
              
              // Redirect will be handled by useEffect when auth state updates
              return;
            }
          } catch (err) {
            console.error("Error during admin Supabase auth:", err);
            // Continue with local auth fallback
          }
        }
        
        // Local authentication fallback for admin
        const adminUsername = username === "Ayman" || username === "ayman.soliman.cc@gmail.com" ? "Ayman" : "Admin";
        
        toast({
          title: "Success!",
          description: `Welcome back, ${adminUsername}!`,
        });
        
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherUsername", adminUsername);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("teacherId", `admin-${adminUsername}-${Date.now().toString()}`);
        
        // Short delay to allow state to update
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 100);
        
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
        
        // Check for admin status by email
        const adminEmails = ['ayman.soliman.cc@gmail.com', 'admin@pokeayman.com', 'admin@example.com'];
        const isAdminEmail = adminEmails.includes(data.user.email?.toLowerCase() || '');
        
        toast({
          title: "Success!",
          description: "Welcome back, Teacher!",
        });
        
        // Redirect will be handled by useEffect when auth state updates
        // We're keeping these for backward compatibility
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherUsername", userData.username || username);
        localStorage.setItem("teacherId", data.user.id);
        
        // Check for admin status
        if (isAdminEmail || userData.username === "Admin" || userData.username === "Ayman") {
          localStorage.setItem("isAdmin", "true");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoginInProgress(false);
    }
  };
  
  if (loading && !loginInProgress) {
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
