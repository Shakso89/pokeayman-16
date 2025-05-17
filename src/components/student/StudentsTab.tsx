
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import StudentsList from "./students-tab/StudentsList";
import SortControls from "./students-tab/SortControls";
import LoadingState from "./students-tab/LoadingState";
import { useStudentsData } from "./students-tab/useStudentsData";

interface StudentsTabProps {
  classId: string;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ classId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { students, isLoading, sortOrder, toggleSortOrder } = useStudentsData(classId);

  const handleStudentClick = (studentId: string) => {
    // Navigate to the student profile page
    navigate(`/student/profile/${studentId}`);
  };

  if (isLoading) {
    return <LoadingState t={t} />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{t("class-students")}</h3>
          <SortControls sortOrder={sortOrder} toggleSortOrder={toggleSortOrder} t={t} />
        </div>

        <StudentsList 
          students={students} 
          onStudentClick={handleStudentClick}
          t={t}
        />
      </CardContent>
    </Card>
  );
};

export default StudentsTab;
