
import React from "react";
import { LoginForm } from "@/components/LoginForm";

const TeacherLogin: React.FC = () => {
  const handleLoginSuccess = (username: string, password: string) => {
    // Set teacher ID in localStorage for reference
    localStorage.setItem("teacherId", "teacher-" + Date.now().toString());
  };
  
  return <LoginForm type="teacher" onLoginSuccess={handleLoginSuccess} />;
};

export default TeacherLogin;
