
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, MessageSquare, User } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserSettingsModal from "./modals/UserSettingsModal";

interface NavBarProps {
  userType: "teacher" | "student";
  userName?: string;
  userAvatar?: string;
}

export const NavBar: React.FC<NavBarProps> = ({ userType, userName, userAvatar }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png"
            alt="PokéAyman Logo" 
            className="h-12 w-auto" 
          />
          <h1 className="text-xl font-bold">
            {userType === "teacher" ? t("teacher-dashboard") : t("student-dashboard")}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageSelector />
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/${userType === "teacher" ? "teacher" : "student"}/messages`)}
            title={t("messages")}
          >
            <MessageSquare size={20} />
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
      
      <UserSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        userType={userType} 
      />
    </div>
  );
};
