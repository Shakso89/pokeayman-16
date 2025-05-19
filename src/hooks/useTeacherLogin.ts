
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  isAymanEmail, 
  isAymanUsername, 
  isAdminUsername, 
  isValidAdminPassword,
  checkDevAdminLogin
} from "@/utils/adminAuth";

export const useTeacherLogin = () => {
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();
  const [error, setError] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    setLoginInProgress(true);
    setError("");

    try {
      console.log("Attempting login with:", username);
      
      // Direct admin login flow
      if (isAymanEmail(username) || isAymanUsername(username) || isAdminUsername(username)) {
        if (isValidAdminPassword(password)) {
          const displayUsername = isAymanEmail(username) ? "Ayman" : username;
          
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("teacherUsername", displayUsername);
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("userEmail", isAymanEmail(username) ? username : `${username.toLowerCase()}@pokeayman.com`);
          localStorage.setItem("teacherId", `admin-${displayUsername}-${Date.now()}`);

          // Refresh the auth state to pick up localStorage changes
          await refreshAuthState();
          
          toast({ title: "Success!", description: `Welcome back, ${displayUsername}!` });
          navigate("/admin-dashboard");
          return;
        }
      }
      
      // Dev admin login handling
      if (checkDevAdminLogin(username, password)) {
        // Set username to "Ayman" if using email
        const displayUsername = username.includes("@") ? "Ayman" : username;
        
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherUsername", displayUsername);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("userEmail", username.includes("@") ? 
                              username.toLowerCase() : 
                              `${username.toLowerCase()}@pokeayman.com`);
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

  return {
    error,
    loginInProgress,
    handleLogin
  };
};
