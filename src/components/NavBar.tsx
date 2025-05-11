
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquare, User, Home, Medal, Settings } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import UserSettingsModal from "./modals/UserSettingsModal";
import NotificationBadge from "./NotificationBadge";
import SearchBar from "./SearchBar";

interface NavBarProps {
  userType: "teacher" | "student";
  userName?: string;
  userAvatar?: string;
}

export const NavBar: React.FC<NavBarProps> = ({
  userType,
  userName,
  userAvatar
}) => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("studentName");
    localStorage.removeItem("teacherUsername");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("studentId");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("studentClassId");
    navigate("/");
  };

  const isAdmin = localStorage.getItem("teacherUsername") === "Admin";
  
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };
  
  const handleViewProfile = () => {
    if (userType === "teacher") {
      const teacherId = localStorage.getItem("teacherId");
      navigate(`/teacher/profile/${teacherId}`);
    } else {
      const studentId = localStorage.getItem("studentId");
      navigate(`/student/profile/${studentId}`);
    }
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <img src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png" alt="PokéAyman Logo" className="h-12 w-auto" />
          <h1 className="text-xl font-bold">
            {userType === "teacher" ? "Teacher Dashboard" : "Student Dashboard"}
          </h1>
        </div>
        
        {/* Added Search Bar */}
        <div className="hidden md:flex flex-1 mx-4">
          <SearchBar />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} title="Home">
            <Home size={20} />
          </Button>
          
          {/* Added Notification Badge */}
          <NotificationBadge />

          <Button variant="secondary" onClick={() => navigate(`/${userType === "teacher" ? "teacher" : "student"}/messages`)} className="flex items-center gap-2">
            <MessageSquare size={20} />
            <span className="hidden md:inline">Messages</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback>
                    {userName?.substring(0, 2).toUpperCase() || "NA"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-gray-500">{userType}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>{t("view-profile")}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t("settings")}</span>
              </DropdownMenuItem>
              
              {isAdmin && userType === "teacher" && (
                <DropdownMenuItem onClick={() => navigate("/admin-dashboard")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("admin-dashboard")}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-2">
        <SearchBar />
      </div>
      
      {isSettingsOpen && (
        <UserSettingsModal 
          isOpen={isSettingsOpen} 
          onClose={handleCloseSettings} 
          userType={userType} 
        />
      )}
    </div>
  );
};

function t(key: string): string {
  // Simple translation function for this component
  const translations: Record<string, string> = {
    "view-profile": "View Profile",
    "settings": "Settings",
    "admin-dashboard": "Admin Dashboard",
    "logout": "Logout"
  };
  
  return translations[key] || key;
}
