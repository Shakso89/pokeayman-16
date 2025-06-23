
// Frontend types (what our React components use)
export interface ClassData {
  id: string;
  name: string;
  description?: string;
  teacher_id?: string;
  school_id?: string;
  created_at: string;
  updated_at?: string;
  students: string[];
  is_public: boolean;
  likes: string[];
  assistants: string[];
}

export interface StudentData {
  id: string;
  username: string;
  display_name?: string;
  class_id?: string;
  school_id?: string;
  teacher_id?: string;
  coins?: number;
  created_at: string;
  is_active?: boolean;
  profile_photo?: string;
}

// Database types (what comes from Supabase)
export interface DatabaseClassData {
  id: string;
  name: string;
  description?: string;
  teacher_id?: string;
  school_id?: string;
  created_at: string;
  updated_at?: string;
  students?: string[];
  is_public?: boolean;
  likes?: string[];
  assistants?: string[];
}

export interface DatabaseStudentData {
  id: string;
  username: string;
  display_name?: string;
  class_id?: string;
  school_id?: string;
  teacher_id?: string;
  coins?: number;
  created_at: string;
  is_active?: boolean;
  profile_photo?: string;
}
