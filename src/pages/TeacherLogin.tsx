
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAILS = [
  "ayman.soliman.cc@gmail.com",
  "ayman.soliman.tr@gmail.com",
  "admin@pokeayman.com",
  "admin@example.com"
];

const ADMIN_USERNAMES = ["Admin", "Ayman"];

const isAdminUser = (email?: string, username?: string) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase() || "") ||
         ADMIN_USERNAMES.includes(username || "");
};

const TeacherLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isAdmin, loading, userType, refreshAuthState } = useAuth();

  const [error, setError] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);

  useEffect(() => {
    if (loading || loginInProgress) return;

    if (isLoggedIn) {
      const redirect = sessionStorage.getItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterLogin");

      console.log("User is logged in:", { userType, isAdmin });
      if (userType === "student") {
        navigate("/student-dashboard");
      } else if (isAdmin) {
        navigate(redirect || "/admin-dashboard");
      } else {
        navigate(redirect || "/teacher-dashboard");
      }
    }
  }, [isLoggedIn, isAdmin, userType, navigate, loginInProgress, loading]);

  const handleLogin = async (username: string, password: string) => {
    setLoginInProgress(true);
    setError("");

    try {
      console.log("Attempting login with:", username);
      
      // Special handling for admin users
      const isAymanEmail = username.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
                           username.toLowerCase() === "ayman.soliman.cc@gmail.com";
      const isAymanUsername = username.toLowerCase() === "ayman";
      const isAdminUsername = username.toLowerCase() === "admin";
      
      // Admin login flow - avoid using bcryptjs
      if (isAymanEmail || isAymanUsername || isAdminUsername) {
        const validAdminPassword = password === "AymanPassword" || password === "AdminAyman";
        
        if (validAdminPassword) {
          const displayUsername = isAymanEmail ? "Ayman" : username;
          
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("teacherUsername", displayUsername);
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("userEmail", isAymanEmail ? username : `${username.toLowerCase()}@pokeayman.com`);
          localStorage.setItem("teacherId", `admin-${displayUsername}-${Date.now()}`);

          // Refresh the auth state to pick up localStorage changes
          await refreshAuthState();
          
          toast({ title: "Success!", description: `Welcome back, ${displayUsername}!` });
          navigate("/admin-dashboard");
          return;
        }
      }
      
      // Regular dev admin login handling
      const isDevAdminLogin =
        import.meta.env.MODE === "development" &&
        (ADMIN_USERNAMES.includes(username) || ADMIN_EMAILS.includes(username.toLowerCase())) &&
        (password === "AdminAyman" || password === "AymanPassword");

      if (isDevAdminLogin) {
        // Set username to "Ayman" if using email
        const displayUsername = username.includes("@") ? "Ayman" : username;
        
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherUsername", displayUsername);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("userEmail", username.includes("@") ? username.toLowerCase() : `${username.toLowerCase()}@pokeayman.com`);
        localStorage.setItem("teacherId", `admin-${username}-${Date.now()}`);

        // Refresh the auth state to pick up localStorage changes
        await refreshAuthState();
        
        toast({ title: "Success!", description: `Welcome back, ${displayUsername}` });
        navigate("/admin-dashboard");
        return;
      }

      // Standard flow for non-admin users (using Supabase auth)
      const isEmail = username.includes("@");
      const email = isEmail ? username : `${username}@pokeayman.com`;

      // Attempt login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log("Supabase login result:", { data, error });

      if (error) {
        // For backward compatibility - try to find teacher in local storage
        const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        const teacher = teachers.find((t: any) => 
          t.username === username || t.email === username
        );
        
        if (teacher && teacher.password === password) {
          // Use localStorage for now but try to migrate to Supabase auth
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("teacherUsername", teacher.username || "");
          localStorage.setItem("isAdmin", teacher.isAdmin ? "true" : "false");
          localStorage.setItem("teacherId", teacher.id);
          
          await refreshAuthState();
          
          toast({ title: "Success!", description: "Welcome back!" });
          navigate(teacher.isAdmin ? "/admin-dashboard" : "/teacher-dashboard");
          return;
        }
        
        throw error;
      }

      // Auth state will be updated automatically via onAuthStateChange
      // but we can also manually refresh if needed
      await refreshAuthState();

      toast({ title: "Success!", description: "Welcome back!" });
      
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      toast({
        title: "Login failed",
        description: err.message || "Invalid username or password",
        variant: "destructive",
      });
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
          style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))" }}
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
