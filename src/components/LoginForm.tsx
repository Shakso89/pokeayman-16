import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "./AuthLayout";
import { toast } from "@/hooks/use-toast";
import { User, Lock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { setActivationStatus } from "@/utils/activationService";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { initializeTeacherCredits } from "@/utils/creditService";

interface LoginFormProps {
  type: "teacher" | "student";
  onLoginSuccess?: (username: string, password: string) => void;
  darkMode?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ type, onLoginSuccess, darkMode = false }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === "teacher") {
        // Special case for admin login - Added "Ayman" as admin
        if ((usernameOrEmail === "Admin" || usernameOrEmail === "admin@pokeayman.com" || usernameOrEmail === "Ayman") && 
            (password === "AdminAyman" || (usernameOrEmail === "Ayman" && password === "AymanPassword"))) {
          
          const adminUsername = usernameOrEmail === "Ayman" ? "Ayman" : "Admin";
          
          toast({
            title: "Success!",
            description: `Welcome back, ${adminUsername}!`,
          });
          
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("teacherUsername", adminUsername);
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("teacherId", `admin-${adminUsername}-${Date.now().toString()}`);
          setActivationStatus(true);
          
          // Initialize admin credits
          initializeTeacherCredits(
            localStorage.getItem("teacherId") || "", 
            adminUsername,
            adminUsername
          );
          
          if (onLoginSuccess) {
            onLoginSuccess(adminUsername, password);
          }
          
          navigate("/admin-dashboard");
          return;
        }

        // Check if input is email (contains @)
        const isEmail = usernameOrEmail.includes('@');
        
        // First try to sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          // If it's an email, use it as email, otherwise use it as username in the email field but will be handled in fallback
          email: isEmail ? usernameOrEmail : `${usernameOrEmail}@placeholder.com`,
          password,
        });

        if (authError) {
          console.log("Auth error:", authError.message);
          
          // Fallback to legacy authentication
          const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
          const teacher = teachers.find((t: any) => 
            t.username === usernameOrEmail || t.email === usernameOrEmail
          );
          
          if (teacher && teacher.password === password) {
            toast({
              title: "Success!",
              description: "Welcome back, Teacher!",
            });
            localStorage.setItem("userType", "teacher");
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("teacherUsername", teacher.username);
            localStorage.setItem("isAdmin", "false");
            
            if (teacher.isActive) {
              setActivationStatus(true);
            } else {
              setActivationStatus(false);
            }
            
            localStorage.setItem("teacherId", teacher.id);
            
            // Initialize teacher credits if not already done
            initializeTeacherCredits(
              teacher.id, 
              teacher.username,
              teacher.displayName || teacher.username
            );
            
            if (onLoginSuccess) {
              onLoginSuccess(usernameOrEmail, password);
            }
            
            navigate("/teacher-dashboard");
          } else {
            throw new Error("Invalid username/email or password.");
          }
        } else if (authData.user) {
          // Successfully authenticated with Supabase
          const userMetadata = authData.user.user_metadata;
          
          toast({
            title: "Success!",
            description: "Welcome back, Teacher!",
          });
          
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("teacherUsername", userMetadata.username || usernameOrEmail);
          localStorage.setItem("isAdmin", "false");
          localStorage.setItem("teacherId", authData.user.id);
          
          // Initialize teacher credits if not already done
          initializeTeacherCredits(
            authData.user.id, 
            userMetadata.username || usernameOrEmail,
            userMetadata.displayName || userMetadata.username || usernameOrEmail
          );
          
          if (onLoginSuccess) {
            onLoginSuccess(usernameOrEmail, password);
          }
          
          navigate("/teacher-dashboard");
        }
      } else {
        // Student login - similar approach but using student records
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const student = students.find((s: any) => s.username === usernameOrEmail && s.password === password);
        
        if (student) {
          toast({
            title: "Success!",
            description: "Welcome back, Student!",
          });
          localStorage.setItem("userType", "student");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("studentName", usernameOrEmail);
          localStorage.setItem("studentId", student.id);
          
          if (onLoginSuccess) {
            onLoginSuccess(usernameOrEmail, password);
          }
          
          navigate("/student-dashboard");
        } else {
          throw new Error("Invalid username or password. If you don't have an account, ask your teacher to create one for you.");
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid username/email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={type === "teacher" ? t("teacher-login") : t("student-login")}
      description={`${t("login-to-access")} ${type === "teacher" ? t("teacher-dashboard").toLowerCase() : t("student-dashboard").toLowerCase()}`}
      className={darkMode ? "bg-black/70 text-white border-gray-800" : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="usernameOrEmail" className={darkMode ? "text-white" : ""}>
            {type === "teacher" ? "Username or Email" : "Username"}
          </Label>
          <div className="relative">
            <Input
              id="usernameOrEmail"
              placeholder={type === "teacher" ? "Enter your username or email" : "Enter your username"}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className={cn("pl-10", darkMode && "bg-black/30 border-gray-700 text-white")}
              required
            />
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className={darkMode ? "text-white" : ""}>{t("password") || "Password"}</Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder={t("enter-your-password") || "Enter your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn("pl-10", darkMode && "bg-black/30 border-gray-700 text-white")}
              required
            />
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
          </div>
        </div>
        <Button 
          type="submit" 
          className={cn("w-full", darkMode && "bg-blue-600 hover:bg-blue-700")} 
          disabled={isLoading}
        >
          {isLoading ? t("logging-in") || "Logging in..." : t("login") || "Login"}
        </Button>
        
        {type === "teacher" && (
          <div className="text-center text-sm mt-4">
            <p>
              {t("dont-have-account") || "Don't have an account?"}{" "}
              <button 
                type="button" 
                onClick={() => navigate("/teacher-signup")}
                className={darkMode ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline"}
              >
                {t("sign-up") || "Sign up"}
              </button>
            </p>
          </div>
        )}
        
        {type === "student" && (
          <div className="mt-4 text-center">
            <div className={cn("bg-black/50 backdrop-blur-sm p-4 rounded-lg", !darkMode && "bg-white/80")}>
              <p className="font-medium mb-2">{t("are-you-a-teacher") || "Are you a teacher?"}</p>
              <Button
                variant="default"
                onClick={() => navigate("/teacher-login")}
                className={cn("w-full", darkMode && "bg-blue-600 hover:bg-blue-700")}
              >
                {t("teacher-login") || "Teacher Login"}
              </Button>
              <p className="text-sm mt-2 text-gray-400">
                {t("student-account-help") || "Students need an account created by their teacher"}
              </p>
            </div>
          </div>
        )}
        
        <div className="text-center text-sm mt-2">
          <button 
            type="button" 
            onClick={() => navigate("/")}
            className={darkMode ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline"}
          >
            {t("back-to-home") || "Back to home"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
