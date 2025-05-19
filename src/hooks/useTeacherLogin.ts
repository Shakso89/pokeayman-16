
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Admin emails that should always have admin access
const ADMIN_EMAILS = [
  "ayman.soliman.tr@gmail.com",
  "ayman.soliman.cc@gmail.com",
  "admin@pokeayman.com",
  "admin@example.com"
];

// Admin usernames that should always have admin access
const ADMIN_USERNAMES = ["Admin", "Ayman"];

// Passwords that grant admin access
const ADMIN_PASSWORDS = ["AdminAyman", "AymanPassword"];

export const useTeacherLogin = () => {
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();
  const [error, setError] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);

  const isAdminUser = (username: string): boolean => {
    // Check if username is an admin email
    if (ADMIN_EMAILS.includes(username.toLowerCase())) {
      return true;
    }
    
    // Check if username is an admin username
    if (ADMIN_USERNAMES.includes(username)) {
      return true;
    }
    
    return false;
  };

  const isAdminPassword = (password: string): boolean => {
    return ADMIN_PASSWORDS.includes(password);
  };

  const handleAdminLogin = async (username: string, password: string) => {
    console.log("Processing admin login:", username);
    
    // Determine display username (Ayman or Admin)
    const displayUsername = username.includes("ayman") || username === "Ayman" 
      ? "Ayman" 
      : "Admin";
    
    // Set up localStorage values for admin
    localStorage.setItem("userType", "teacher");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("teacherUsername", displayUsername);
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("userEmail", username.includes("@") ? username : `${username.toLowerCase()}@pokeayman.com`);
    localStorage.setItem("teacherId", `admin-${displayUsername}-${Date.now()}`);

    // Try to sign in with Supabase if we have valid credentials
    try {
      // Only attempt Supabase auth if we have an email
      if (username.includes("@")) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username,
          password: password
        });
        
        if (error) {
          // For admin users, we'll continue even if Supabase auth fails
          console.warn("Supabase auth failed for admin, using local auth:", error.message);
        } else {
          console.log("Admin authenticated with Supabase:", data.user?.id);
        }
      }
    } catch (err) {
      console.warn("Error during Supabase auth attempt:", err);
      // Continue with local auth for admins
    }

    // Refresh the auth state to pick up localStorage changes
    await refreshAuthState();
    
    toast({ title: "Success!", description: `Welcome back, ${displayUsername}!` });
    navigate("/admin-dashboard");
  };

  const handleTeacherLogin = async (username: string, password: string) => {
    // Check if input is email (contains @)
    const isEmail = username.includes('@');
    const email = isEmail ? username : `${username}@placeholder.com`;
    
    // Try Supabase auth first
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      // Check for email verification error
      if (authError.message?.includes("Email not confirmed")) {
        throw new Error("Please verify your email address before logging in. Check your inbox for a verification link.");
      }
      
      // Try legacy login (localStorage)
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
      
      throw authError;
    }

    // Auth state will be updated automatically via onAuthStateChange
    await refreshAuthState();
    
    // Extra check for admin status based on email
    if (data.user?.email && ADMIN_EMAILS.includes(data.user.email.toLowerCase())) {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("teacherUsername", "Ayman");
      await refreshAuthState();
      navigate("/admin-dashboard");
    } else {
      navigate("/teacher-dashboard");
    }
    
    toast({ title: "Success!", description: "Welcome back!" });
  };

  const handleLogin = async (username: string, password: string) => {
    setLoginInProgress(true);
    setError("");

    try {
      console.log("Attempting login with:", username);
      
      // Handle admin login cases
      if (isAdminUser(username) && isAdminPassword(password)) {
        await handleAdminLogin(username, password);
        return;
      }
      
      // Special case for Ayman email with admin password
      if (username.toLowerCase() === "ayman.soliman.tr@gmail.com" && isAdminPassword(password)) {
        await handleAdminLogin(username, password);
        return;
      }
      
      // Special case: any username with "admin" and password "AdminAyman" for development
      if ((username.toLowerCase().includes("admin") || username.toLowerCase() === "ayman") && 
          password === "AdminAyman") {
        await handleAdminLogin(username, password);
        return;
      }

      // Standard teacher login flow
      await handleTeacherLogin(username, password);
      
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

  return {
    error,
    loginInProgress,
    handleLogin
  };
};
