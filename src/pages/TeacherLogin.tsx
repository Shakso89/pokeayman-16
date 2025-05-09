
import React from "react";
import { LoginForm } from "@/components/LoginForm";
import { useNavigate } from "react-router-dom";

const TeacherLogin: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLoginSuccess = (username: string, password: string) => {
    // Check if this is the admin login
    const isAdmin = username === "Admin" && password === "AdminAyman";
    
    // Store admin status if it's the admin
    if (isAdmin) {
      localStorage.setItem("isAdmin", "true");
      // Redirect to admin dashboard
      navigate("/admin-dashboard");
    }
  };
  
  return (
    <>
      <LoginForm type="teacher" onLoginSuccess={handleLoginSuccess} />
    </>
  );
};

export default TeacherLogin;
