
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface NavBarProps {
  userType: "teacher" | "student";
  userName?: string;
}

export const NavBar: React.FC<NavBarProps> = ({ userType, userName }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("studentName");
    navigate("/");
  };
  
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png"
            alt="TR Ayman Logo" 
            className="h-12 w-auto" 
          />
          <h1 className="text-xl font-bold">
            {userType === "teacher" ? "Teacher Dashboard" : "Student Dashboard"}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-medium">{userType === "teacher" ? "Admin" : userName || "Student"}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
