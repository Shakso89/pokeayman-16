
import React from "react";
import { cn } from "@/lib/utils";

interface AvatarBorderProps {
  children: React.ReactNode;
  achievement?: "star_of_class" | "top_of_school" | null;
  className?: string;
}

const AvatarBorder: React.FC<AvatarBorderProps> = ({
  children,
  achievement,
  className
}) => {
  const getBorderStyle = () => {
    switch (achievement) {
      case "star_of_class":
        return "border-4 border-transparent bg-gradient-to-r from-yellow-400 via-blue-500 to-yellow-400 p-1 rounded-full animate-pulse";
      case "top_of_school":
        return "border-4 border-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 p-1 rounded-full animate-pulse shadow-lg shadow-purple-500/50";
      default:
        return "";
    }
  };

  if (!achievement) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      <div className={getBorderStyle()}>
        <div className="bg-white rounded-full p-1">
          {children}
        </div>
      </div>
      {achievement === "star_of_class" && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">⭐</span>
        </div>
      )}
      {achievement === "top_of_school" && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">👑</span>
        </div>
      )}
    </div>
  );
};

export default AvatarBorder;
