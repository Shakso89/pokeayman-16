
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StudentInfoBadgeProps {
  student: {
    id: string;
    name: string;
  };
  submissionDate: string;
  onNavigateToProfile: (studentId: string) => void;
}

export const StudentInfoBadge: React.FC<StudentInfoBadgeProps> = ({
  student,
  submissionDate,
  onNavigateToProfile
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Avatar 
        className="h-8 w-8 cursor-pointer" 
        onClick={() => onNavigateToProfile(student.id)}
      >
        <AvatarFallback>
          {student.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">{student.name}</p>
        <p className="text-xs text-gray-500">
          {new Date(submissionDate).toLocaleDateString()} {new Date(submissionDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
      </div>
    </div>
  );
};
