
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  isAdminEmail,
  isAdminUsername,
  isValidAdminPassword
} from "@/utils/adminAuth";

export const useTeacherLogin = () => {
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();
  const [error, setError] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);

  // Handle admin login flow
  const handleAdminLogin = async (username: string, password: string) => {
    try {
      const email = username.includes("@") ? username.toLowerCase() : `${username.toLowerCase()}@pokeayman.com`;
      const displayUsername = username.includes("ayman") || username === "Ayman" ? "Ayman" : "Admin";

      console.log(`Admin login attempt for: ${email}`);

      // Try to sign in with Supabase first
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      // If sign in fails, try to sign up (for development convenience)
      if (signInError) {
        console.log("Admin signin failed, attempting signup:", signInError.message);
        
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: displayUsername,
              user_type: "teacher",
              is_admin: true,
            },
          },
        });

        if (signUpError) {
          console.error("Admin signup also failed:", signUpError.message);
          throw new Error(signUpError.message);
        }
      }

      // Set localStorage values
      localStorage.setItem("userType", "teacher");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("teacherUsername", displayUsername);
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("teacherId", data?.user?.id || `admin-${displayUsername}-${Date.now()}`);

      // Refresh auth state to update context
      await refreshAuthState();

      toast({ 
        title: "Success!", 
        description: `Welcome back, ${displayUsername}!` 
      });
      
      navigate("/admin-dashboard", { replace: true });
    } catch (err: any) {
      console.error("Admin login failed:", err);
      throw err; // Rethrow to be caught by the main handler
    }
  };

  // Handle teacher login flow
  const handleTeacherLogin = async (username: string, password: string) => {
    const isEmail = username.includes("@");
    const email = isEmail ? username.toLowerCase() : `${username.toLowerCase()}@placeholder.com`;

    // Try to authenticate with Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      if (authError.message?.includes("Email not confirmed")) {
        throw new Error("Please verify your email address before logging in.");
      }

      // Local fallback for development
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacher = teachers.find((t: any) => 
        t.username.toLowerCase() === username.toLowerCase() || 
        t.email?.toLowerCase() === username.toLowerCase()
      );

      if (teacher && teacher.password === password) {
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherUsername", teacher.username);
        localStorage.setItem("teacherId", teacher.id);
        localStorage.setItem("isAdmin", teacher.isAdmin ? "true" : "false");

        await refreshAuthState();
        toast({ title: "Success!", description: "Welcome back!" });
        navigate(teacher.isAdmin ? "/admin-dashboard" : "/teacher-dashboard", { replace: true });
        return;
      }

      throw authError;
    }

    // Authentication successful via Supabase
    const userEmail = data.user?.email?.toLowerCase() || "";
    const isAdmin = isAdminEmail(userEmail);
    const usernameFromMetadata = data.user?.user_metadata?.username || "";

    // Set localStorage values
    localStorage.setItem("userType", "teacher");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("teacherUsername", usernameFromMetadata || username);
    localStorage.setItem("teacherId", data.user?.id || "");
    localStorage.setItem("userEmail", userEmail);
    if (isAdmin) localStorage.setItem("isAdmin", "true");

    await refreshAuthState();
    toast({ title: "Success!", description: "Welcome back!" });
    navigate(isAdmin ? "/admin-dashboard" : "/teacher-dashboard", { replace: true });
  };

  // Main login handler
  const handleLogin = async (username: string, password: string) => {
    setLoginInProgress(true);
    setError("");

    try {
      console.log("Login attempt:", username);

      // Check if this is an admin login
      const isAdmin =
        (isAdminUsername(username) || isAdminEmail(username)) &&
        isValidAdminPassword(password);

      // Special handling for admin users
      if (isAdmin) {
        await handleAdminLogin(username, password);
      } else if (
        (username.toLowerCase().includes("admin") || username.toLowerCase() === "ayman") &&
        password === "AdminAyman"
      ) {
        await handleAdminLogin(username, password);
      } else {
        await handleTeacherLogin(username, password);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      toast({
        title: "Login failed",
        description: err.message || "Invalid credentials",
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
