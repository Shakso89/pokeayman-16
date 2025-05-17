
import React from "react";
import { Student } from "@/types/pokemon";
import StudentCard from "./StudentCard";

interface StudentWithPokemon extends Student {
  pokemonCount: number;
  coins: number;
}

interface StudentsListProps {
  students: StudentWithPokemon[];
  onStudentClick: (studentId: string) => void;
  t: (key: string, fallback?: string) => string;
}

const StudentsList: React.FC<StudentsListProps> = ({ students, onStudentClick, t }) => {
  if (students.length === 0) {
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
        <p className="text-lg font-medium text-gray-500">{t("no-students-found")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map(student => (
        <StudentCard 
          key={student.id}
          student={student}
          onClick={onStudentClick}
          t={t}
        />
      ))}
    </div>
  );
};

export default StudentsList;
