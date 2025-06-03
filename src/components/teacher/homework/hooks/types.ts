
export interface StudentSelection {
  id: string;
  name: string;
}

export interface HomeworkManagementState {
  activeTab: "active" | "archived" | "review";
  isCreateHomeworkOpen: boolean;
  isGiveCoinsOpen: boolean;
  selectedStudent: StudentSelection | null;
  selectedClassId: string;
  selectedClassName: string;
}
