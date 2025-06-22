
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
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  const positionClasses = position === "absolute" 
    ? "absolute -top-1 -right-1 z-10" 
    : "inline-flex gap-2";

  if (!isStarOfClass && !isTopOfClass && !isTopOfSchool) {
    if (showContext) {
      return (
        <div className="text-gray-500 text-sm">
          No special achievements yet
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`${positionClasses} flex gap-2 items-center`}>
      {isStarOfClass && (
        <div className={`flex ${showContext ? 'flex-col' : 'flex-row'} items-center gap-1`}>
          <Star className={`${sizeClasses[size]} text-yellow-500 fill-yellow-500`} />
          {showContext && (
            <span className={`${textSizeClasses[size]} text-yellow-600 font-medium`}>
              Star of Class
            </span>
          )}
        </div>
      )}
      {isTopOfClass && (
        <div className={`flex ${showContext ? 'flex-col' : 'flex-row'} items-center gap-1`}>
          <Award className={`${sizeClasses[size]} text-orange-500 fill-orange-500`} />
          {showContext && (
            <span className={`${textSizeClasses[size]} text-orange-600 font-medium`}>
              Top in Class
            </span>
          )}
        </div>
      )}
      {isTopOfSchool && (
        <div className={`flex ${showContext ? 'flex-col' : 'flex-row'} items-center gap-1`}>
          <Trophy className={`${sizeClasses[size]} text-red-500 fill-red-500`} />
          {showContext && (
            <span className={`${textSizeClasses[size]} text-red-600 font-medium`}>
              Top in School
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentBadges;
