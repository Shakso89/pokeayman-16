
// Custom type definitions for our Supabase database
// Use this alongside the auto-generated types

export type TeacherCredit = {
  id: string;
  teacher_id: string;
  credits: number;
  used_credits: number;
  created_at: string;
  updated_at: string;
};

export type CreditTransaction = {
  id: string;
  teacher_id: string;
  amount: number;
  reason: string | null;
  timestamp: string;
};

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
  school_id?: string | null;
  students?: string[];
  is_public?: boolean;
  description?: string;
  likes?: string[];
  created_at: string;
};

// Extended database interface for use with custom types
export interface CustomDatabase {
  public: {
    Tables: {
      teacher_credits: {
        Row: TeacherCredit;
        Insert: Omit<TeacherCredit, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<TeacherCredit, 'id'>>;
      };
      credit_transactions: {
        Row: CreditTransaction;
        Insert: Omit<CreditTransaction, 'id' | 'timestamp'> & {
          id?: string;
          timestamp?: string;
        };
        Update: Partial<Omit<CreditTransaction, 'id'>>;
      };
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
