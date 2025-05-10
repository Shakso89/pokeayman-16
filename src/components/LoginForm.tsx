
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "./AuthLayout";
import { toast } from "@/hooks/use-toast";
import { User } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { setActivationStatus } from "@/utils/activationService";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  type: "teacher" | "student";
  onLoginSuccess?: (username: string, password: string) => void;
  darkMode?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ type, onLoginSuccess, darkMode = false }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple authentication for demo purposes
    setTimeout(() => {
      if (type === "teacher") {
        // Check if user exists in our "database" (localStorage)
        const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
        const teacher = teachers.find((t: any) => t.username === username && t.password === password);
        
        if (teacher || (username === "Admin" && password === "AdminAyman")) {
          toast({
            title: "Success!",
            description: "Welcome back, Teacher!",
          });
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("isLoggedIn", "true");
          
          // Store the teacher's username for admin access check
          localStorage.setItem("teacherUsername", username);
          
          // If it's Admin account, set isAdmin flag and activate account
          if (username === "Admin") {
            localStorage.setItem("isAdmin", "true");
            setActivationStatus(true); // Updated to pass only boolean
          } else {
            localStorage.removeItem("isAdmin");
            
            // Set activation status based on teacher record
            if (teacher && teacher.isActive) {
              setActivationStatus(true); // Updated to pass only boolean
            } else {
              setActivationStatus(false); // Updated to pass only boolean
            }
          }
          
          // If it's a registered teacher (not Admin), store their ID
          if (teacher) {
            localStorage.setItem("teacherId", teacher.id);
          } else {
            // For Admin login
            localStorage.setItem("teacherId", "teacher-" + Date.now().toString());
          }
          
          if (onLoginSuccess) {
            onLoginSuccess(username, password);
          }
          
          navigate("/teacher-dashboard");
        } else {
          toast({
            title: "Authentication failed",
            description: "Invalid username or password.",
            variant: "destructive",
          });
        }
      } else {
        // For student login, we check if the student exists
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const student = students.find((s: any) => s.username === username && s.password === password);
        
        if (student) {
          toast({
            title: "Success!",
            description: "Welcome back, Student!",
          });
          localStorage.setItem("userType", "student");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("studentName", username);
          localStorage.setItem("studentId", student.id);
          
          if (onLoginSuccess) {
            onLoginSuccess(username, password);
          }
          
          navigate("/student-dashboard");
        } else {
          toast({
            title: "Authentication failed",
            description: "Invalid username or password. If you don't have an account, ask your teacher to create one for you.",
            variant: "destructive",
          });
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AuthLayout
      title={type === "teacher" ? t("teacher-login") : t("student-login")}
      description={`${t("login-to-access")} ${type === "teacher" ? t("teacher-dashboard").toLowerCase() : t("student-dashboard").toLowerCase()}`}
      className={darkMode ? "bg-black/70 text-white border-gray-800" : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className={darkMode ? "text-white" : ""}>{t("username") || "Username"}</Label>
          <div className="relative">
            <Input
              id="username"
              placeholder={t("enter-your-username") || "Enter your username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn("pl-10", darkMode && "bg-black/30 border-gray-700 text-white")}
              required
            />
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className={darkMode ? "text-white" : ""}>{t("password") || "Password"}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t("enter-your-password") || "Enter your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={darkMode ? "bg-black/30 border-gray-700 text-white" : ""}
            required
          />
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
