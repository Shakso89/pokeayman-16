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

  const handleAdminLogin = async (username: string, password: string) => {
    const email = username.includes("@") ? username : `${username.toLowerCase()}@pokeayman.com`;
    const displayUsername = username.includes("ayman") || username === "Ayman" ? "Ayman" : "Admin";

    // Set localStorage
    localStorage.setItem("userType", "teacher");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("teacherUsername", displayUsername);
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("teacherId", `admin-${displayUsername}-${Date.now()}`);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error && isAdminEmail(email)) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
          console.warn("Supabase admin signup failed:", signUpError.message);
        } else {
          console.log("Admin signed up:", signUpData?.user?.id);
        }
      } else {
        console.log("Admin signed in:", data?.user?.id);
      }
    } catch (err) {
      console.warn("Supabase admin auth fallback:", err);
    }

    await refreshAuthState();
    toast({ title: "Success!", description: `Welcome back, ${displayUsername}!` });
    navigate("/admin-dashboard", { replace: true });
  };

  const handleTeacherLogin = async (username: string, password: string) => {
    const isEmail = username.includes("@");
    const email = isEmail ? username : `${username}@placeholder.com`;

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      if (authError.message?.includes("Email not confirmed")) {
        throw new Error("Please verify your email address before logging in.");
      }

      // Try local fallback
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacher = teachers.find((t: any) => t.username === username || t.email === username);

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

    // If authenticated through Supabase
    const userEmail = data.user?.email || "";
    const isAdmin = isAdminEmail(userEmail);
    const usernameFromMetadata = data.user?.user_metadata?.username || "";

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

  const handleLogin = async (username: string, password: string) => {
    setLoginInProgress(true);
    setError("");

    try {
      console.log("Login attempt:", username);

      const isAdmin =
        (isAdminUsername(username) || isAdminEmail(username)) &&
        isValidAdminPassword(password);

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
