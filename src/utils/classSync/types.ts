
// Class data interface
export interface ClassData {
  id: string;
  name: string;
  description?: string;
  teacherId: string | null;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  students?: string[];
  isPublic?: boolean;
  likes?: string[];
  assistants?: string[];
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
  is_active?: boolean;
  last_login?: string;
  metadata?: Record<string, any>;
}

// Database to Frontend Mapping
export interface DatabaseClassData {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string | null;
  school_id: string | null;
  created_at: string;
  updated_at?: string;
  students?: string[] | null;
  is_public?: boolean | null;
  likes?: string[] | null;
  assistants?: string[] | null;
}

export interface DatabaseStudentData {
  id: string;
  username: string;
  display_name: string | null;
  email?: string | null;
  class_id?: string | null;
  school_id?: string | null;
  teacher_id?: string | null;
  created_at: string;
  updated_at?: string;
  is_active?: boolean | null;
  last_login?: string | null;
}
