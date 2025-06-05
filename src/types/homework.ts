
export interface Homework {
  id: string;
  title: string;
  description: string;
  coin_reward: number;
  type: 'image' | 'audio' | 'multiple_choice';
  class_id: string;
  teacher_id: string;
  created_at: string;
  expires_at: string;
  // Multiple choice specific fields
  questions?: HomeworkQuestion[];
  // Legacy fields for backward compatibility
  question?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: 'A' | 'B' | 'C' | 'D';
}

export interface HomeworkQuestion {
  id?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  student_name: string;
  content: string; // URL for media, JSON for multiple choice answers
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  is_correct?: boolean;
  answers?: { [questionId: string]: string }; // For multiple questions
}
