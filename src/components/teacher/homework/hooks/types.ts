
export interface HomeworkManagementState {
  activeTab: "active" | "archived" | "review";
  isCreateHomeworkOpen: boolean;
  homeworkAssignments: import("@/types/homework").HomeworkAssignment[];
  homeworkSubmissions: import("@/types/homework").HomeworkSubmission[];
  classes: Array<{ id: string; name: string }>;
  isGiveCoinsOpen: boolean;
  selectedStudent: {id: string, name: string} | null;
  selectedClassId: string;
  selectedClassName: string;
}

export interface StudentSelection {
  id: string;
  name: string;
}
