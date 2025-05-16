
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
      
      if (session?.user) {
        const userData = session.user.user_metadata || {};
        
        // If already logged in, redirect to dashboard
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("teacherId", session.user.id);
        localStorage.setItem("teacherUsername", userData.username || session.user.email?.split('@')[0] || '');
        
        // Check for admin status
        const adminEmails = ['ayman.soliman.cc@gmail.com', 'admin@example.com', 'ayman.soliman.cc@gmial.com'];
        if (userData.username === "Admin" || userData.username === "Ayman" || 
            adminEmails.includes(session.user.email?.toLowerCase() || '')) {
          localStorage.setItem("isAdmin", "true");
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/teacher-dashboard", { replace: true });
        }
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
      const adminEmails = ['ayman.soliman.cc@gmail.com', 'admin@example.com', 'ayman.soliman.cc@gmial.com'];
      
      if ((username === "Admin" || username === "admin@pokeayman.com" || username === "Ayman" || 
           adminEmails.includes(username.toLowerCase())) && 
          (password === "AdminAyman" || (username === "Ayman" && password === "AymanPassword"))) {
        
        // For admin, we'll use Supabase auth to ensure session persistence
        let adminEmail = username;
        if (!adminEmail.includes('@')) {
          adminEmail = 'admin@pokeayman.com'; // Default email for admin
        }
        
        // Try to sign in with Supabase (this creates a proper session)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: password,
        });
        
        if (error) {
          // If login fails, create a new account for the admin
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: password,
            options: {
              data: {
                username: username === "Ayman" ? "Ayman" : "Admin",
                user_type: "teacher",
                is_admin: true
              }
            }
          });
          
          if (signUpError) {
            throw new Error("Could not create admin account: " + signUpError.message);
          }
          
          // Try to sign in again
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: password,
          });
          
          if (loginError) {
            throw loginError;
          }
        }
        
        const adminUsername = username === "Ayman" ? "Ayman" : "Admin";
        
        toast({
          title: "Success!",
          description: `Welcome back, ${adminUsername}!`,
        });
        
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherUsername", adminUsername);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("teacherId", data?.user?.id || `admin-${Date.now()}`);
        
        navigate("/admin-dashboard", { replace: true });
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
        const userEmail = data.user.email?.toLowerCase() || '';
        
        toast({
          title: "Success!",
          description: "Welcome back, Teacher!",
        });
        
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherUsername", userData.username || username);
        localStorage.setItem("teacherId", data.user.id);
        
        // Check for admin status
        const adminEmails = ['ayman.soliman.cc@gmail.com', 'admin@example.com', 'ayman.soliman.cc@gmial.com'];
        if (userData.username === "Admin" || userData.username === "Ayman" || 
            adminEmails.includes(userEmail)) {
          localStorage.setItem("isAdmin", "true");
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/teacher-dashboard", { replace: true });
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
