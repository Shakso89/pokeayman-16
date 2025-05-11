
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Student } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface ClassmatesTabProps {
  classId: string;
}

const ClassmatesTab: React.FC<ClassmatesTabProps> = ({ classId }) => {
  const { t } = useTranslation();
  const [classmates, setClassmates] = useState<Student[]>([]);
  
  useEffect(() => {
    loadClassmates();
  }, [classId]);
  
  const loadClassmates = () => {
    // In a real app, we would fetch from an API
    // For this demo, we'll use localStorage
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    
    // Filter students for this class
    const classStudents = allStudents.filter((student: Student) => 
      student.classId === classId
    );
    
    setClassmates(classStudents);
  };
  
  if (classmates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("no-classmates-found")}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("classmates")}: {classmates.length}</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {classmates.map(student => (
          <div
            key={student.id}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={student.avatar} alt={student.displayName} />
              <AvatarFallback>
                {student.displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h4 className="font-medium text-center">{student.displayName}</h4>
            <p className="text-xs text-gray-500">@{student.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassmatesTab;
