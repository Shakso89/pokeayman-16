
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { useTranslation } from "@/hooks/useTranslation";
import ActiveHomeworkTab from "./ActiveHomeworkTab";
import ArchivedHomeworkTab from "./ArchivedHomeworkTab";

interface HomeworkTabsProps {
  activeTab: "active" | "archived";
  onTabChange: (tab: "active" | "archived") => void;
  activeHomework: HomeworkAssignment[];
  archivedHomework: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  classes: Array<{ id: string; name: string }>;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onApproveSubmission: (submission: HomeworkSubmission) => void;
  onRejectSubmission: (submission: HomeworkSubmission) => void;
  onDeleteHomework: (homeworkId: string) => void;
  onCreateHomework: (classId: string, className: string) => void;
}

const HomeworkTabs: React.FC<HomeworkTabsProps> = ({
  activeTab,
  onTabChange,
  activeHomework,
  archivedHomework,
  submissions,
  classes,
  onAwardCoins,
  onApproveSubmission,
  onRejectSubmission,
  onDeleteHomework,
  onCreateHomework
}) => {
  const { t } = useTranslation();
  
  const getClassNameById = (classId: string) => {
    const foundClass = classes.find(c => c.id === classId);
    return foundClass ? foundClass.name : t("unknown-class");
  };
  
  const navigateToStudentProfile = (studentId: string) => {
    // Navigate to student profile
    window.location.href = `/teacher/student/${studentId}`;
  };
  
  return (
    {/* Add unique key to isolate this Tabs component */}
    <Tabs 
      key="homework-management-tabs"
      value={activeTab} 
      onValueChange={(val) => onTabChange(val as "active" | "archived")} 
      className="mt-6"
    >
      <TabsList className="grid grid-cols-2 mb-6">
        <TabsTrigger value="active">{t("active-homework")}</TabsTrigger>
        <TabsTrigger value="archived">{t("archived-homework")}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active">
        <ActiveHomeworkTab 
          activeHomework={activeHomework}
          submissions={submissions}
          classes={classes}
          onAwardCoins={onAwardCoins}
          onApproveSubmission={onApproveSubmission}
          onRejectSubmission={onRejectSubmission}
          onDeleteHomework={onDeleteHomework}
          onCreateHomework={onCreateHomework}
          onNavigateToStudentProfile={navigateToStudentProfile}
        />
      </TabsContent>
      
      <TabsContent value="archived">
        <ArchivedHomeworkTab 
          archivedHomework={archivedHomework}
          submissions={submissions}
          getClassNameById={getClassNameById}
          onAwardCoins={onAwardCoins}
          onDeleteHomework={onDeleteHomework}
          onNavigateToStudentProfile={navigateToStudentProfile}
        />
      </TabsContent>
    </Tabs>
  );
};

export default HomeworkTabs;
