
// Custom type definitions for our Supabase database
// Use this alongside the auto-generated types

export type School = {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Class = {
  id: string;
  name: string;
  teacher_id: string | null;
  school_id: string | null;
  students: string[];
  is_public: boolean;
  description: string | null;
  likes: string[];
  created_at: string;
};

// Extended database interface for use with custom types
export interface CustomDatabase {
  public: {
    Tables: {
      schools: {
        Row: School;
        Insert: Omit<School, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<School, 'id'>>;
      };
      classes: {
        Row: Class;
        Insert: Omit<Class, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Class, 'id'>>;
      };
    };
  };
}
