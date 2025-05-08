
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "./AuthLayout";
import { toast } from "@/hooks/use-toast";
import { User } from "lucide-react";

interface LoginFormProps {
  type: "teacher" | "student";
  onLoginSuccess?: (username: string, password: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ type, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
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
      title={`${type === "teacher" ? "Teacher" : "Student"} Login`}
      description={`Login to access your ${type === "teacher" ? "teacher" : "student"} dashboard`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
              required
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
        
        {type === "teacher" && (
          <div className="text-center text-sm mt-4">
            <p>
              Don't have an account?{" "}
              <button 
                type="button" 
                onClick={() => navigate("/teacher-signup")}
                className="text-blue-600 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        )}
        
        {type === "student" && (
          <div className="text-center text-sm mt-4">
            <p>
              Don't have an account? Ask your teacher to create one for you.
            </p>
          </div>
        )}
        
        <div className="text-center text-sm mt-2">
          <button 
            type="button" 
            onClick={() => navigate("/")}
            className="text-blue-600 hover:underline"
          >
            Back to home
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
