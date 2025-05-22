
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import StudentsList from "./students-tab/StudentsList";
import SortControls from "./students-tab/SortControls";
import LoadingState from "./students-tab/LoadingState";
import { useStudentsData } from "./students-tab/useStudentsData";
import { StudentsList as StudentsDialog } from "@/components/student-profile/StudentsList";
import { toast } from "@/hooks/use-toast";
import { addMultipleStudentsToClass } from "@/utils/classSync/studentOperations";

interface StudentsTabProps {
  classId: string;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ classId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const { students, isLoading, sortOrder, toggleSortOrder, refreshStudents } = useStudentsData(classId);
  const [refreshCount, setRefreshCount] = useState(0);

  // Effect to refresh data when classId changes or refresh is triggered
  useEffect(() => {
    if (classId) {
      refreshStudents();
    }
  }, [classId, refreshCount]);

  const handleStudentClick = (studentId: string) => {
    // Navigate to the student profile page
    navigate(`/student/profile/${studentId}`);
  };
  
  const handleAddStudents = async (studentIds: string[]) => {
    if (!classId || studentIds.length === 0) return;
    
    try {
      const result = await addMultipleStudentsToClass(classId, studentIds);
      
      if (result) {
        toast({
          title: t("success"),
          description: `${studentIds.length} students added to class`
        });
        
        // Refresh the student list after adding students
        refreshStudents();
        setRefreshCount(prev => prev + 1);
      } else {
        throw new Error("Failed to add students to class");
      }
    } catch (error) {
      console.error("Error adding students to class:", error);
      toast({
        title: t("error"),
        description: t("failed-to-add-students"),
        variant: "destructive"
      });
    }
  };
  
  const handleManualRefresh = () => {
    refreshStudents();
    setRefreshCount(prev => prev + 1);
    toast({
      title: t("refreshing"),
      description: t("refreshing-student-list")
    });
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
            <Button
              size="icon"
              variant="outline"
              onClick={handleManualRefresh}
              className="h-8 w-8"
              title={t("refresh")}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
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
          onStudentsAdded={handleAddStudents}
        />
      </CardContent>
    </Card>
  );
};

export default StudentsTab;
