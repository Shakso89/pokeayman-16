
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { useTranslation } from "@/hooks/useTranslation";
import AdminHeader from "@/components/admin/AdminHeader";
import EnhancedAdminDashboard from "@/components/admin/EnhancedAdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { userRole, permissions, isLoading: roleLoading } = useUserRole();

  // Check admin access - now includes owner access
  useEffect(() => {
    if (!roleLoading && !permissions.canAssignRoles && userRole !== 'owner') {
      navigate("/teacher-dashboard");
    }
  }, [roleLoading, permissions.canAssignRoles, userRole, navigate]);

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || (!permissions.canAssignRoles && userRole !== 'owner')) {
    return null; // Will redirect in useEffect
  }

  const userEmail = user?.email?.toLowerCase();
  const username = localStorage.getItem("teacherUsername") || "";
  const storedEmail = localStorage.getItem("userEmail")?.toLowerCase() || "";
  const isAymanEmail =
    userEmail === "ayman.soliman.tr@gmail.com" ||
    userEmail === "ayman.soliman.cc@gmail.com" ||
    storedEmail === "ayman.soliman.tr@gmail.com" ||
    storedEmail === "ayman.soliman.cc@gmail.com";
  const isAymanUsername = username === "Ayman" || username === "Admin";

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar 
        userType="teacher" 
        userName={isAymanEmail || isAymanUsername ? "Ayman" : userRole === 'owner' ? "Owner" : "Admin"} 
      />

      <div className="container mx-auto py-8 px-4">
        <AdminHeader />
        <EnhancedAdminDashboard 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
