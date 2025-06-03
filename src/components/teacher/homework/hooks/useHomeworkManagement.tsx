
import { useHomeworkData } from "./useHomeworkData";
import { useHomeworkOperations } from "./useHomeworkOperations";
import { useSubmissionOperations } from "./useSubmissionOperations";
import { useHomeworkUIState } from "./useHomeworkUIState";

export const useHomeworkManagement = (teacherId: string) => {
  // Data management
  const {
    homework,
    setHomework,
    submissions,
    setSubmissions,
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
    handleHomeworkCreated(homework, setHomework);

  const wrappedHandleDeleteHomework = (homeworkId: string) => 
    handleDeleteHomework(homeworkId, setHomework, setSubmissions);

  const wrappedHandleApproveSubmission = (submission: any) => 
    handleApproveSubmission(submission, homework, setSubmissions);

  const wrappedHandleRejectSubmission = (submission: any, feedback?: string) => 
    handleRejectSubmission(submission, feedback, setSubmissions);

  // Filter homework based on expiration
  const now = new Date();
  const activeHomework = homework.filter(hw => new Date(hw.expires_at) > now);
  const archivedHomework = homework.filter(hw => new Date(hw.expires_at) <= now);

  return {
    activeTab,
    setActiveTab,
    isCreateHomeworkOpen,
    setIsCreateHomeworkOpen,
    homework,
    setHomework,
    submissions,
    setSubmissions,
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
