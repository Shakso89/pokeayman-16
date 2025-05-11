
import React from "react";
import StudentCard from "./StudentCard";

interface Student {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  pokemonCount: number;
  coins: number;
}

interface StudentListProps {
  students: Student[];
  onStudentClick: (studentId: string) => void;
  t: (key: string) => string;
}

const StudentList: React.FC<StudentListProps> = ({ students, onStudentClick, t }) => {
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

export default StudentList;
