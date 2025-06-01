
export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  type: "text" | "image" | "audio" | "multiple_choice";
  classId: string;
  teacherId: string;
  createdAt: string;
  expiresAt: string; // 48 hours after creation
  coinReward: number;
  questions?: MultipleChoiceQuestion[]; // For multiple choice homework
}

export interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswers: number[]; // indices of correct options (can be multiple)
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  content: string; // URL for image/audio, text content, or JSON for multiple choice answers
  type: "text" | "image" | "audio" | "multiple_choice";
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  answers?: number[][]; // For multiple choice submissions - array of selected option indices per question
}
