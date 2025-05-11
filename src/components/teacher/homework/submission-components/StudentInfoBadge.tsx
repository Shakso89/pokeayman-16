
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

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
  // Find student avatar if available
  const [avatar, setAvatar] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    // Try to get the student avatar from localStorage
    try {
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const studentData = allStudents.find((s: any) => s.id === student.id);
      if (studentData && studentData.avatar) {
        setAvatar(studentData.avatar);
      }
    } catch (error) {
      console.error("Error getting student avatar:", error);
    }
  }, [student.id]);

  return (
    <div 
      className="flex items-center space-x-2 cursor-pointer" 
      onClick={() => onNavigateToProfile(student.id)}
    >
      <Avatar className="h-8 w-8">
        {avatar && <AvatarImage src={avatar} alt={student.name} />}
        <AvatarFallback>
          {student.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm hover:text-blue-600 transition-colors">
          {student.name}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(submissionDate).toLocaleDateString()} {new Date(submissionDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
      </div>
    </div>
  );
};
