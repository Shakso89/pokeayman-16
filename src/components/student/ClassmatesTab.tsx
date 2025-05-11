
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Student } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent } from "@/components/ui/card";

interface ClassmatesTabProps {
  classId: string;
}

const ClassmatesTab: React.FC<ClassmatesTabProps> = ({ classId }) => {
  const { t } = useTranslation();
  const [classmates, setClassmates] = useState<Student[]>([]);
  const navigate = useNavigate();
  
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
  
  const handleStudentClick = (studentId: string) => {
    // Always navigate to the student profile page
    navigate(`/student/profile/${studentId}`);
  };
  
  if (classmates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gray-50 rounded-full p-6 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-500">{t("no-classmates-found")}</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-6">{t("classmates")}: {classmates.length}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {classmates.map(student => (
            <div
              key={student.id}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleStudentClick(student.id)}
            >
              <Avatar className="h-16 w-16 mb-3">
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
      </CardContent>
    </Card>
  );
};

export default ClassmatesTab;
