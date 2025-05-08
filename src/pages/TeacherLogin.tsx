
import React from "react";
import { LoginForm } from "@/components/LoginForm";
import CodeGenerator from "@/components/CodeGenerator";

const TeacherLogin: React.FC = () => {
  const handleLoginSuccess = (username: string, password: string) => {
    // Check if this is the admin login
    const isAdmin = username === "Admin" && password === "AdminAyman";
    
    // Store admin status if it's the admin
    if (isAdmin) {
      localStorage.setItem("isAdmin", "true");
    }
  };
  
  return (
    <>
      <LoginForm type="teacher" onLoginSuccess={handleLoginSuccess} />
    </>
  );
};

export default TeacherLogin;
