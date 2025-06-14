
import React from "react";

interface School {
  id: string;
  name: string;
}
interface SchoolClass {
  id: string;
  name: string;
  description?: string;
}

interface StudentProfileSchoolClassesProps {
  school: School | undefined;
  classes: SchoolClass[];
  onSchoolClick: (id: string) => void;
  onClassClick: (id: string) => void;
}

const StudentProfileSchoolClasses: React.FC<StudentProfileSchoolClassesProps> = ({
  school,
  classes,
  onSchoolClick,
  onClassClick
}) => (
  <div className="mt-4">
    {school && (
      <div
        className="mb-3 font-medium text-blue-700 cursor-pointer hover:underline flex items-center gap-1"
        onClick={() => onSchoolClick(school.id)}
      >
        School: {school.name}
      </div>
    )}
    <div>
      {classes.map((c) => (
        <div
          key={c.id}
          onClick={() => onClassClick(c.id)}
          className="p-2 rounded bg-purple-100 text-purple-800 mb-1 cursor-pointer hover:bg-purple-200"
        >
          {c.name} {c.description && <span className="text-xs text-gray-500">({c.description})</span>}
        </div>
      ))}
    </div>
  </div>
);

export default StudentProfileSchoolClasses;
