
import React from "react";
import { Star, Award, Trophy } from "lucide-react";

interface StudentBadgesProps {
  studentId: string;
  classData?: {
    star_student_id?: string;
    top_student_id?: string;
  };
  schoolData?: {
    top_student_id?: string;
  };
  size?: "sm" | "md" | "lg";
  position?: "absolute" | "relative";
  showContext?: boolean;
}

const StudentBadges: React.FC<StudentBadgesProps> = ({
  studentId,
  classData,
  schoolData,
  size = "md",
  position = "absolute",
  showContext = false
}) => {
  const isStarOfClass = classData?.star_student_id === studentId;
  const isTopOfClass = classData?.top_student_id === studentId;
  const isTopOfSchool = schoolData?.top_student_id === studentId;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  };

  const positionClasses = position === "absolute" 
    ? "absolute -top-1 -right-1 z-10" 
    : "inline-flex gap-1";

  if (!isStarOfClass && !isTopOfClass && !isTopOfSchool) {
    return null;
  }

  return (
    <div className={`${positionClasses} ${sizeClasses[size]} flex gap-1`}>
      {isStarOfClass && (
        <div className="flex flex-col items-center">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          {showContext && (
            <span className="text-xs text-yellow-600 mt-1">Star of Class</span>
          )}
        </div>
      )}
      {isTopOfClass && (
        <div className="flex flex-col items-center">
          <Award className="w-5 h-5 text-orange-500 fill-orange-500" />
          {showContext && (
            <span className="text-xs text-orange-600 mt-1">Top in Class</span>
          )}
        </div>
      )}
      {isTopOfSchool && (
        <div className="flex flex-col items-center">
          <Trophy className="w-5 h-5 text-red-500 fill-red-500" />
          {showContext && (
            <span className="text-xs text-red-600 mt-1">Top in School</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentBadges;
