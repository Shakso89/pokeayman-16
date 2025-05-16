
// Class data interface
export interface ClassData {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  additionalInfo?: Record<string, any>;
}

// Student data interface
export interface StudentData {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  avatar?: string;
  class_id?: string;
  school_id?: string;
  teacher_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
