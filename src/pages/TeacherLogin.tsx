
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import LoginForm from "@/components/LoginForm";
import { ensureTeacherCredits } from "@/utils/creditService";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  
  const handleLogin = (username: string, password: string) => {
    // Get teachers from localStorage
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    
    // Find teacher by username and password
    const teacher = teachers.find(
      (t: any) => t.username === username && t.password === password
    );
    
    if (teacher) {
      // Set login state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "teacher");
      localStorage.setItem("teacherId", teacher.id);
      localStorage.setItem("teacherUsername", username);
      
      // Initialize credits if they don't already exist
      ensureTeacherCredits(teacher.id, username, teacher.displayName);
      
      // Update last login timestamp
      const updatedTeachers = teachers.map((t: any) => {
        if (t.id === teacher.id) {
          return {
            ...t,
            lastLogin: new Date().toISOString()
          };
        }
        return t;
      });
      localStorage.setItem("teachers", JSON.stringify(updatedTeachers));
      
      // Redirect to teacher dashboard
      navigate("/teacher-dashboard");
    } else {
      // Show error message
      setError("Invalid username or password");
    }
  };
  
  return (
    <AuthLayout>
      <LoginForm
        title="Teacher Login"
        userType="teacher"
        onSubmit={handleLogin}
        error={error}
        forgotPasswordUrl="#"
        signUpUrl="/teacher-signup"
      />
    </AuthLayout>
  );
};

export default TeacherLogin;
