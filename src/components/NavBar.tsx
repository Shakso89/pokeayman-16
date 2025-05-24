import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquare, UserCog, Home, Medal, School } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import UserSettingsModal from "./modals/UserSettingsModal";
import NotificationBadge from "./NotificationBadge";
import { useTranslation } from "@/hooks/useTranslation";
import { SelectSchoolDialog } from "./teacher/class-management/SelectSchoolDialog";
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
  const {
    t
  } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSelectSchoolOpen, setIsSelectSchoolOpen] = useState(false);

  const handleLogout = () => {
    // Navigate to logout page which will handle the full logout process
    navigate("/logout");
  };

  const handleHomeClick = () => {
    // Direct to the appropriate dashboard based on user type
    if (userType === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleViewProfile = () => {
    if (userType === "teacher") {
      const teacherId = localStorage.getItem("teacherId");
      if (teacherId) {
        navigate(`/teacher/profile/${teacherId}`);
      } else {
        console.error("Teacher ID not found in localStorage");
      }
    } else {
      const studentId = localStorage.getItem("studentId");
      if (studentId) {
        navigate(`/student/profile/${studentId}`);
      } else {
        console.error("Student ID not found in localStorage");
      }
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
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleHomeClick} title="Home" className="text-slate-600 bg-slate-300 hover:bg-slate-200">
            <Home size={20} />
          </Button>
          
          {/* Added Notification Badge */}
          <NotificationBadge />

          {userType === "teacher" && <Button variant="secondary" onClick={() => setIsSelectSchoolOpen(true)} className="flex items-center gap-2">
              <School size={20} />
              <span className="hidden md:inline">{t("create-class")}</span>
            </Button>}

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
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>{t("profile-and-settings")}</span>
              </DropdownMenuItem>
              
              {isAdmin && userType === "teacher" && <DropdownMenuItem onClick={() => navigate("/admin-dashboard")}>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>{t("admin-dashboard")}</span>
                </DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {isSettingsOpen && <UserSettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} userType={userType} />}
      
      {userType === "teacher" && <SelectSchoolDialog open={isSelectSchoolOpen} onOpenChange={setIsSelectSchoolOpen} teacherId={localStorage.getItem("teacherId") || ""} />}
    </div>
  );
};
