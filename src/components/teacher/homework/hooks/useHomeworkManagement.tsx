
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
    setClasses,
    loadHomework,
    loadSubmissions
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
  const { handleHomeworkCreated, handleDeleteHomework, handleCreateHomework: createHomework } = useHomeworkOperations();

  // Submission operations
  const { handleApproveSubmission, handleRejectSubmission } = useSubmissionOperations();

  // Create wrapped handlers that include state setters
  const wrappedHandleHomeworkCreated = (homework: any) => {
    handleHomeworkCreated(homework, setHomework);
    loadSubmissions(); // Reload submissions after creating homework
  };

  const wrappedHandleDeleteHomework = (homeworkId: string) => 
    handleDeleteHomework(homeworkId, setHomework, setSubmissions);

  const wrappedHandleApproveSubmission = (submission: any) => 
    handleApproveSubmission(submission, homework, setSubmissions, teacherId);

  const wrappedHandleRejectSubmission = (submission: any, feedback?: string) => 
    handleRejectSubmission(submission, feedback, setSubmissions);

  const wrappedHandleCreateHomework = async (homeworkData: any) => {
    const success = await createHomework(homeworkData, teacherId, setHomework);
    if (success) {
      loadSubmissions(); // Reload submissions after creating homework
    }
    return success;
  };

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
    handleCreateHomework: wrappedHandleCreateHomework,
    handleDeleteHomework: wrappedHandleDeleteHomework,
    handleApproveSubmission: wrappedHandleApproveSubmission,
    handleRejectSubmission: wrappedHandleRejectSubmission,
    activeHomework,
    archivedHomework,
    loadHomework,
    loadSubmissions
  };
};
