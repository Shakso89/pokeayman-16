
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import CreateHomeworkDialog from "./CreateHomeworkDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import HomeworkManagementHeader from "./homework/HomeworkManagementHeader";
import HomeworkTabs from "./homework/HomeworkTabs";
import { useHomeworkManagement } from "./homework/useHomeworkManagement";

interface HomeworkManagementProps {
  onBack: () => void;
  teacherId: string;
}

const HomeworkManagement: React.FC<HomeworkManagementProps> = ({ onBack, teacherId }) => {
  const { t } = useTranslation();
  
  const {
    activeTab,
    setActiveTab,
    isCreateHomeworkOpen,
    setIsCreateHomeworkOpen,
    homeworkSubmissions,
    classes,
    isGiveCoinsOpen,
    setIsGiveCoinsOpen,
    selectedStudent,
    setSelectedStudent,
    selectedClassId,
    selectedClassName,
    handleHomeworkCreated,
    handleGiveCoins,
    handleCreateHomework,
    handleDeleteHomework,
    activeHomework,
    archivedHomework
  } = useHomeworkManagement(teacherId);

  return (
    <div>
      <HomeworkManagementHeader 
        onBack={onBack} 
        onCreateHomework={handleCreateHomework}
        classes={classes}
      />
      
      <HomeworkTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeHomework={activeHomework}
        archivedHomework={archivedHomework}
        submissions={homeworkSubmissions}
        classes={classes}
        onAwardCoins={(studentId, studentName) => {
          setSelectedStudent({id: studentId, name: studentName});
          setIsGiveCoinsOpen(true);
        }}
        onDeleteHomework={handleDeleteHomework}
        onCreateHomework={handleCreateHomework}
      />
      
      <CreateHomeworkDialog
        open={isCreateHomeworkOpen}
        onOpenChange={setIsCreateHomeworkOpen}
        onHomeworkCreated={handleHomeworkCreated}
        teacherId={teacherId}
        classId={selectedClassId}
        className={selectedClassName}
      />

      <GiveCoinsDialog
        open={isGiveCoinsOpen}
        onOpenChange={setIsGiveCoinsOpen}
        onGiveCoins={handleGiveCoins}
      />
    </div>
  );
};

export default HomeworkManagement;
