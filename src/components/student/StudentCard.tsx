
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StudentCardProps {
  student: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string;
    pokemonCount: number;
    coins: number;
  };
  onClick: (studentId: string) => void;
  t: (key: string) => string;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onClick, t }) => {
  return (
    <div 
      onClick={() => onClick(student.id)}
      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={student.avatar} />
        <AvatarFallback>
          {student.displayName?.substring(0, 2).toUpperCase() || "ST"}
        </AvatarFallback>
      </Avatar>

      <div className="ml-3 flex-1">
        <p className="font-medium">{student.displayName}</p>
        <p className="text-sm text-gray-500">@{student.username}</p>
      </div>

      <div className="text-right">
        <p className="font-semibold">{student.pokemonCount} {t("pokemon")}</p>
        <p className="text-sm text-gray-500">{student.coins} {t("coins")}</p>
      </div>
    </div>
  );
};

export default StudentCard;
