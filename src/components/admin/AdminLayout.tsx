
import React from "react";
import { NavBar } from "@/components/NavBar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType="admin" 
        userName="Admin"
      />
      {children}
    </div>
  );
};
