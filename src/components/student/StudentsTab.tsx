
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useStudents } from "@/hooks/useStudents";
import NoStudentsFound from "./NoStudentsFound";
import StudentList from "./StudentList";
import SortButton from "./SortButton";

interface StudentsTabProps {
  classId: string;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ classId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { students, sortOrder, toggleSortOrder } = useStudents(classId);

  const handleStudentClick = (studentId: string) => {
    // Navigate to the student profile page
    navigate(`/student/profile/${studentId}`);
  };

  if (students.length === 0) {
    return <NoStudentsFound t={t} />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{t("class-students")}</h3>
          <SortButton sortOrder={sortOrder} onClick={toggleSortOrder} t={t} />
        </div>

        <StudentList 
          students={students} 
          onStudentClick={handleStudentClick} 
          t={t} 
        />
      </CardContent>
    </Card>
  );
};

export default StudentsTab;
