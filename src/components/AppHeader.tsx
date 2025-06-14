
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import NotificationBadge from "@/components/NotificationBadge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  userType: "teacher" | "student";
  userName?: string;
  userAvatar?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  userType,
  userName,
  userAvatar
}) => {
  const navigate = useNavigate();

  // Determine dashboard link based on user type
  const dashboardRoute =
    userType === "teacher" ? "/teacher-dashboard" : "/student-dashboard";

  return (
    <div className="w-full bg-sky-300 py-3 px-6 flex items-center justify-between border-b">
      <div className="flex items-center gap-3">
        <img
          src="/lovable-uploads/40c04be5-3d6e-4938-9a00-006177dbef3b.png"
          alt="PokéAyman Logo"
          className="h-12 w-auto"
        />
        <h1 className="text-xl md:text-2xl font-bold text-black">
          {userType === "teacher" ? "Teacher Dashboard" : "Student Dashboard"}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(dashboardRoute)}
          title="Home"
          className="text-slate-700 bg-slate-200 hover:bg-slate-100"
        >
          <Home size={20} />
        </Button>
        <NotificationBadge />
        <Button
          variant="secondary"
          onClick={() => navigate(`/messages`)}
          className="flex items-center gap-2"
        >
          {/* The text label is only shown on md+ screens */}
          <span className="hidden md:inline">Messages</span>
        </Button>
        <Avatar>
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>
            {userName?.substring(0, 2).toUpperCase() || "NA"}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default AppHeader;
