
import { useHomeworkData } from "./useHomeworkData";
import { useHomeworkOperations } from "./useHomeworkOperations";
import { useSubmissionOperations } from "./useSubmissionOperations";
import { useHomeworkUIState } from "./useHomeworkUIState";

export const useHomeworkManagement = (teacherId: string) => {
  // Data management
  const {
    homeworkAssignments,
    setHomeworkAssignments,
    homeworkSubmissions,
    setHomeworkSubmissions,
    classes,
    setClasses
  } = useHomeworkData(teacherId);

  // UI state management
  const {
    activeTab,
    setActiveTab,
    isCreateHomeworkOpen,
    setIsCreateHomeworkOpen,
    isGiveCoinsOpen,
    setIsGiveCoinsOpen,
    selectedStudent,
    setSelectedStudent,
    selectedClassId,
    selectedClassName,
    setSelectedClassName,
    handleGiveCoins,
    handleCreateHomework
  } = useHomeworkUIState();

  // Homework operations
  const { handleHomeworkCreated, handleDeleteHomework } = useHomeworkOperations();

  // Submission operations
  const { handleApproveSubmission, handleRejectSubmission } = useSubmissionOperations();

  // Create wrapped handlers that include state setters
  const wrappedHandleHomeworkCreated = (homework: any) => 
    handleHomeworkCreated(homework, setHomeworkAssignments);

  const wrappedHandleDeleteHomework = (homeworkId: string) => 
    handleDeleteHomework(homeworkId, setHomeworkAssignments, setHomeworkSubmissions);

  const wrappedHandleApproveSubmission = (submission: any) => 
    handleApproveSubmission(submission, homeworkAssignments, setHomeworkSubmissions);

  const wrappedHandleRejectSubmission = (submission: any, feedback?: string) => 
    handleRejectSubmission(submission, feedback, setHomeworkSubmissions);

  // Filter homework based on expiration
  const now = new Date();
  const activeHomework = homeworkAssignments.filter(hw => new Date(hw.expiresAt) > now);
  const archivedHomework = homeworkAssignments.filter(hw => new Date(hw.expiresAt) <= now);

  return {
    activeTab,
    setActiveTab,
    isCreateHomeworkOpen,
    setIsCreateHomeworkOpen,
    homeworkAssignments,
    setHomeworkAssignments,
    homeworkSubmissions,
    setHomeworkSubmissions,
    classes,
    setClasses,
    isGiveCoinsOpen,
    setIsGiveCoinsOpen,
    selectedStudent,
    setSelectedStudent,
    selectedClassId,
    selectedClassName,
    setSelectedClassName,
    handleHomeworkCreated: wrappedHandleHomeworkCreated,
    handleGiveCoins,
    handleCreateHomework,
    handleDeleteHomework: wrappedHandleDeleteHomework,
    handleApproveSubmission: wrappedHandleApproveSubmission,
    handleRejectSubmission: wrappedHandleRejectSubmission,
    activeHomework,
    archivedHomework
  };
};
