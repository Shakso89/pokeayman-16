
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import NotificationBadge from "./NotificationBadge";

interface NavBarProps {
  userType: "teacher" | "student" | "admin";
  userName?: string;
  userAvatar?: string;
}

export const NavBar: React.FC<NavBarProps> = ({ userType, userName, userAvatar }) => {
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    window.location.href = "/";
  };

  const renderUserAvatar = () => (
    <div className="flex gap-2 items-center">
      <Avatar className="h-8 w-8">
        {userAvatar ? (
          <AvatarImage src={userAvatar} alt={userName || "User"} />
        ) : (
          <AvatarFallback>{userName?.substring(0, 2) || "U"}</AvatarFallback>
        )}
      </Avatar>
      <span className="text-sm font-medium hidden md:inline-block">
        {userName || "User"}
      </span>
    </div>
  );

  const getNavItems = () => {
    switch (userType) {
      case "admin":
        return (
          <>
            <Link to="/admin">Dashboard</Link>
          </>
        );
      case "teacher":
        return (
          <>
            <Link to="/teacher">Dashboard</Link>
            <Link to="/teacher/homework">Homework</Link>
            <Link to="/teacher/reports">Reports</Link>
          </>
        );
      case "student":
        return (
          <>
            <Link to="/student">Dashboard</Link>
            <Link to="/student/homework">Homework</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-blue-600 mr-10">
              EduPokémon
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-6">
              {getNavItems()}
              <Link to="/messages">Messages</Link>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {userType && (
              <>
                <NotificationBadge />
                
                <Link to={userType === "teacher" ? "/teacher/profile" : userType === "student" ? "/student/profile" : "/admin/profile"}>
                  {renderUserAvatar()}
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-600"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
