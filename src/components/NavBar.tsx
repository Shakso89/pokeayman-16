
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquare, UserCog, Home, Medal } from "lucide-react";
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
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSelectSchoolOpen, setIsSelectSchoolOpen] = useState(false);

  const handleLogout = () => {
    console.log('NavBar: Redirecting to logout page');
    navigate('/logout');
  };

  const handleHomeClick = () => {
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
        console.log("Navigating to teacher profile:", teacherId);
        navigate(`/teacher-profile/${teacherId}`);
      } else {
        console.error("Teacher ID not found in localStorage");
        navigate("/teacher-dashboard");
      }
    } else {
      const studentId = localStorage.getItem("studentId");
      if (studentId) {
        console.log("Navigating to student profile:", studentId);
        navigate(`/student-profile/${studentId}`);
      } else {
        console.error("Student ID not found in localStorage");
        navigate("/student-dashboard");
      }
    }
  };

  const handleRankingsClick = () => {
    if (userType === "student") {
      navigate("/rankings");
    } else {
      navigate("/teacher/rankings");
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 cursor-pointer" onClick={handleHomeClick}>
                <img
                  src="/lovable-uploads/ba2eeb4e-ffdf-4d91-9bfc-182a58aef8da.png"
                  alt="PokéAyman"
                  className="h-10 w-auto"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  {userType === "teacher" ? 
                    (isAdmin ? "Admin Dashboard" : "Teacher Dashboard") : 
                    "Student Dashboard"
                  }
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={handleHomeClick}>
                <Home className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" onClick={handleRankingsClick}>
                <Medal className="h-5 w-5" />
              </Button>

              <NotificationBadge />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar} alt={userName || "User"} />
                      <AvatarFallback>
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{userName || "User"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {userType === "teacher" ? "Teacher" : "Student"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleViewProfile}>
                    <UserCog className="mr-2 h-4 w-4" />
                    {t("view-profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <UserCog className="mr-2 h-4 w-4" />
                    {t("settings")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <UserSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={handleCloseSettings}
        userType={userType}
      />

      <SelectSchoolDialog
        open={isSelectSchoolOpen}
        onOpenChange={setIsSelectSchoolOpen}
        teacherId={localStorage.getItem("teacherId") || ""}
        onClassCreated={() => {
          console.log("Class created successfully");
          setIsSelectSchoolOpen(false);
        }}
      />
    </>
  );
};
