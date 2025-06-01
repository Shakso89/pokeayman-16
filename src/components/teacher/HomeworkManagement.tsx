
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useHomeworkManagement } from "./homework/hooks/useHomeworkManagement";
import CreateHomeworkDialog from "./CreateHomeworkDialog";
import GiveCoinsDialog from "@/components/dialogs/GiveCoinsDialog";
import HomeworkTabs from "./homework/HomeworkTabs";

interface HomeworkManagementProps {
  onBack: () => void;
  teacherId: string;
  classId?: string; // Optional classId to filter homework for specific class
}

const HomeworkManagement: React.FC<HomeworkManagementProps> = ({
  onBack,
  teacherId,
  classId
}) => {
  const {
    activeTab,
    setActiveTab,
    isCreateHomeworkOpen,
    setIsCreateHomeworkOpen,
    homeworkAssignments,
    homeworkSubmissions,
    classes,
    isGiveCoinsOpen,
    setIsGiveCoinsOpen,
    selectedStudent,
    selectedClassId,
    selectedClassName,
    setSelectedClassName,
    handleHomeworkCreated,
    handleGiveCoins,
    handleCreateHomework,
    handleDeleteHomework,
    handleApproveSubmission,
    handleRejectSubmission,
    activeHomework,
    archivedHomework
  } = useHomeworkManagement(teacherId);

  // Filter homework and submissions for specific class if classId is provided
  const filteredActiveHomework = classId 
    ? activeHomework.filter(hw => hw.classId === classId)
    : activeHomework;
    
  const filteredArchivedHomework = classId 
    ? archivedHomework.filter(hw => hw.classId === classId)
    : archivedHomework;

  const filteredSubmissions = classId 
    ? homeworkSubmissions.filter(sub => {
        const homework = homeworkAssignments.find(hw => hw.id === sub.homeworkId);
        return homework?.classId === classId;
      })
    : homeworkSubmissions;

  const filteredClasses = classId 
    ? classes.filter(cls => cls.id === classId)
    : classes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {classId ? "Class Homework Management" : "Homework Management"}
              </h1>
              <p className="text-gray-600">
                {classId ? "Manage homework for this specific class" : "Create and manage homework assignments"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              if (classId) {
                // If we're in a specific class, auto-select that class
                const selectedClass = classes.find(cls => cls.id === classId);
                if (selectedClass) {
                  setSelectedClassName(selectedClass.name);
                  handleCreateHomework(classId, selectedClass.name);
                }
              } else {
                setIsCreateHomeworkOpen(true);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Homework
          </Button>
        </div>

        <HomeworkTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeHomework={filteredActiveHomework}
          archivedHomework={filteredArchivedHomework}
          submissions={filteredSubmissions}
          classes={filteredClasses}
          onAwardCoins={(studentId, studentName) => {
            // Implementation for award coins
          }}
          onApproveSubmission={handleApproveSubmission}
          onRejectSubmission={handleRejectSubmission}
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
          studentId={selectedStudent?.id || ""}
        />
      </div>
    </div>
  );
};

export default HomeworkManagement;
