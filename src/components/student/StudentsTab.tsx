
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import StudentsList from "./students-tab/StudentsList";
import SortControls from "./students-tab/SortControls";
import LoadingState from "./students-tab/LoadingState";
import { useStudentsData } from "./students-tab/useStudentsData";
import { StudentsList as StudentsDialog } from "@/components/student-profile/StudentsList";

interface StudentsTabProps {
  classId: string;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ classId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isStudentListOpen, setIsStudentListOpen] = React.useState(false);
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
          <div className="flex gap-2 items-center">
            <SortControls sortOrder={sortOrder} toggleSortOrder={toggleSortOrder} t={t} />
            <Button 
              size="sm" 
              onClick={() => setIsStudentListOpen(true)}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              {t("add-student")}
            </Button>
          </div>
        </div>

        <StudentsList 
          students={students} 
          onStudentClick={handleStudentClick}
          t={t}
        />
        
        {/* Dialog for adding students to class */}
        <StudentsDialog
          classId={classId}
          open={isStudentListOpen}
          onOpenChange={setIsStudentListOpen}
        />
      </CardContent>
    </Card>
  );
};

export default StudentsTab;
