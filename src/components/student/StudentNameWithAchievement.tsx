
import React from "react";
import { Crown, Star } from "lucide-react";

interface StudentNameWithAchievementProps {
  name: string;
  achievement?: "star_of_class" | "top_of_school" | null;
  className?: string;
}

const StudentNameWithAchievement: React.FC<StudentNameWithAchievementProps> = ({
  name,
  achievement,
  className = ""
}) => {
  const getAchievementIcon = () => {
    switch (achievement) {
      case "star_of_class":
        return <Star className="h-4 w-4 text-yellow-500 ml-1" fill="currentColor" />;
      case "top_of_school":
        return <Crown className="h-4 w-4 text-purple-600 ml-1" fill="currentColor" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <span>{name}</span>
      {getAchievementIcon()}
    </div>
  );
};

export default StudentNameWithAchievement;
