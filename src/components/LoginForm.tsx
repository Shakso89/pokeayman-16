import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "./AuthLayout";
import { toast } from "@/hooks/use-toast";
import { User, Lock, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { setActivationStatus } from "@/utils/activationService";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Student } from "@/types/database";
import { handleTeacherLogin, handleAdminLogin } from "@/hooks/auth/teacherAuthService";
import { useAuth } from "@/contexts/AuthContext";
import { checkDevAdminLogin, isAdminUsername, isAdminEmail, isValidAdminPassword } from "@/utils/adminAuth";

export interface LoginFormProps {
  type: "teacher" | "student";
  onLoginSuccess?: (username: string, password: string) => void;
  darkMode?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  type, 
  onLoginSuccess, 
  darkMode = false, 
  error 
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailUnverified, setEmailUnverified] = useState(false);
  const { t } = useTranslation();
  const { refreshAuthState } = useAuth();
  
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    if (!usernameOrEmail.includes('@')) {
      toast({
        title: "Email required",
        description: "Please enter a valid email address to resend verification.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: usernameOrEmail,
        options: {
          emailRedirectTo: window.location.origin + "/teacher-login",
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend verification",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailUnverified(false);

    try {
      if (type === "teacher") {
        // Check if this is an admin login
        const isAdmin = (isAdminUsername(usernameOrEmail) || isAdminEmail(usernameOrEmail)) &&
                       isValidAdminPassword(password);

        // Special handling for admin users
        if (isAdmin || checkDevAdminLogin(usernameOrEmail, password) ||
            usernameOrEmail.toLowerCase() === "ayman.soliman.tr@gmail.com" || 
            usernameOrEmail.toLowerCase() === "ayman") {
          
          const result = await handleAdminLogin(usernameOrEmail, password, () => {});
          await refreshAuthState();
          
          if (onLoginSuccess) {
            onLoginSuccess(usernameOrEmail, password);
          }
          
          navigate(result.redirect);
        } else {
          const result = await handleTeacherLogin(usernameOrEmail, password, () => {});
          await refreshAuthState();
          
          if (onLoginSuccess) {
            onLoginSuccess(usernameOrEmail, password);
          }
          
          navigate(result.redirect);
        }
      } else {
        // Student login logic - keeping existing implementation
        let isAuthenticated = false;
        
        if (usernameOrEmail.includes('@')) {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: usernameOrEmail,
            password,
          });
          
          if (!authError && authData.user) {
            if (authData.user.email_confirmed_at === null) {
              setEmailUnverified(true);
              throw new Error("Please verify your email address before logging in.");
            }
            
            isAuthenticated = true;
            
            const { data: studentData, error: studentError } = await supabase
              .from('students')
              .select('*')
              .eq('id', authData.user.id)
              .single();
            
            if (!studentError && studentData) {
              localStorage.setItem("studentId", studentData.id);
              localStorage.setItem("studentName", studentData.display_name || studentData.username);
              localStorage.setItem("studentClassId", studentData.class_id || "");
              
              await supabase
                .from('students')
                .update({ last_login: new Date().toISOString() })
                .eq('id', studentData.id);
            }
          }
        }
        
        if (!isAuthenticated) {
          const students = JSON.parse(localStorage.getItem("students") || "[]");
          const student = students.find((s: any) => s.username === usernameOrEmail && s.password === password);
          
          if (student) {
            isAuthenticated = true;
            localStorage.setItem("studentId", student.id);
            localStorage.setItem("studentName", student.displayName || student.username);
            localStorage.setItem("studentClassId", student.classId || "");
            
            try {
              const newStudent: Omit<Student, 'last_login'> & { last_login: string } = {
                id: student.id,
                username: student.username,
                password_hash: student.password,
                display_name: student.displayName || student.username,
                teacher_id: student.teacherId,
                class_id: student.classId,
                is_active: true,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
              };
              
              const { data, error } = await supabase
                .from('students')
                .insert(newStudent)
                .select();
              
              if (!error) {
                console.log("Migrated student to database:", data);
              }
            } catch (err) {
              console.error("Error migrating student to database:", err);
            }
          }
        }
        
        if (isAuthenticated) {
          toast({
            title: "Success!",
            description: "Welcome back, Student!",
          });
          
          localStorage.setItem("userType", "student");
          localStorage.setItem("isLoggedIn", "true");
          
          if (onLoginSuccess) {
            onLoginSuccess(usernameOrEmail, password);
          }
          
          navigate("/student-dashboard");
        } else {
          throw new Error("Invalid username or password. If you don't have an account, ask your teacher to create one for you.");
        }
      }
    } catch (error: any) {
      if (error.message?.includes("Email not confirmed")) {
        setEmailUnverified(true);
      }
      
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {emailUnverified && (
          <Alert variant={darkMode ? "default" : "destructive"} className={darkMode ? "bg-yellow-500/20 border-yellow-500 text-white" : ""}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please verify your email address before logging in.
              <Button 
                variant="link" 
                onClick={handleResendVerification} 
                className={darkMode ? "text-yellow-300 p-0 h-auto ml-1" : "text-red-700 p-0 h-auto ml-1"}
                disabled={isLoading}
              >
                Resend verification email
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
