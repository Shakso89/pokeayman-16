
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
      // Enhanced special handling for Ayman email
      const isAymanEmail = username.toLowerCase() === "ayman.soliman.tr@gmail.com";
      const isAymanUsername = username.toLowerCase() === "ayman";
      
      if (isAymanEmail || isAymanUsername) {
        // If using email, set username to "Ayman"
        if (isAymanEmail) {
          username = "Ayman";
        }
        
        // Special admin login for "Ayman" or "ayman.soliman.tr@gmail.com"
        if (password === "AymanPassword" || password === "AdminAyman") {
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("teacherUsername", "Ayman");
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("teacherId", `admin-Ayman-${Date.now()}`);

          // Refresh the auth state to pick up localStorage changes
          await refreshAuthState();
          
          toast({ title: "Success!", description: `Welcome back, Ayman!` });
          navigate("/admin-dashboard");
          return;
        }
      }
      
      // Normal dev admin login handling
      const isDevAdminLogin =
        import.meta.env.MODE === "development" &&
        (ADMIN_USERNAMES.includes(username) || ADMIN_EMAILS.includes(username.toLowerCase())) &&
        (password === "AdminAyman" || password === "AymanPassword");

      if (isDevAdminLogin) {
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherUsername", username === "ayman.soliman.tr@gmail.com" ? "Ayman" : username);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("teacherId", `admin-${username}-${Date.now()}`);

        // Refresh the auth state to pick up localStorage changes
        await refreshAuthState();
        
        toast({ title: "Success!", description: `Welcome back, ${username === "ayman.soliman.tr@gmail.com" ? "Ayman" : username}` });
        navigate("/admin-dashboard");
        return;
      }

      const isEmail = username.includes("@");
      const email = isEmail ? username : `${username}@pokeayman.com`;

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Special handling for ayman.soliman.tr@gmail.com
        if (username.toLowerCase() === "ayman.soliman.tr@gmail.com" && password === "AymanPassword") {
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("teacherUsername", "Ayman");
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("teacherId", `admin-Ayman-${Date.now()}`);
          
          await refreshAuthState();
          
          toast({ title: "Success!", description: "Welcome back, Ayman!" });
          navigate("/admin-dashboard");
          return;
        }
        
        // Check if teacher exists in DB to attempt auto sign-up
        if (error.message.includes("Invalid login credentials")) {
          const { data: teacherData, error: fetchError } = await supabase
            .from("teachers")
            .select("*")
            .or(`username.eq.${username}${isEmail ? `,email.eq.${username}` : ""}`)
            .maybeSingle();

          if (teacherData && !fetchError) {
            const { error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  username: teacherData.username,
                  display_name: teacherData.display_name,
                  user_type: "teacher"
                }
              }
            });

            if (!signUpError) {
              toast({
                title: "Account created!",
                description: "Please check your email to verify your account."
              });
              return;
            }
          }
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
