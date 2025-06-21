
import React from "react";
import { Star, Trophy, Medal } from "lucide-react";

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
}

const StudentBadges: React.FC<StudentBadgesProps> = ({
  studentId,
  classData,
  schoolData,
  size = "md",
  position = "absolute"
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
        <span 
          className="text-yellow-500 drop-shadow-sm" 
          title="Star of the Class"
          role="img"
          aria-label="Star of the Class"
        >
          ⭐
        </span>
      )}
      {isTopOfClass && (
        <span 
          className="text-orange-500 drop-shadow-sm" 
          title="Top Student of Class"
          role="img"
          aria-label="Top Student of Class"
        >
          🥇
        </span>
      )}
      {isTopOfSchool && (
        <span 
          className="text-red-500 drop-shadow-sm" 
          title="Top Student of School"
          role="img"
          aria-label="Top Student of School"
        >
          🏆
        </span>
      )}
    </div>
  );
};

export default StudentBadges;
