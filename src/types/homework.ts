
export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  type: "text" | "image" | "audio";
  classId: string;
  teacherId: string;
  createdAt: string;
  expiresAt: string; // 48 hours after creation
  coinReward: number;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  content: string; // URL for image/audio, or text content
  type: "text" | "image" | "audio";
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
}
