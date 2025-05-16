
// This file contains custom types for the Supabase database
// It extends the auto-generated types

export interface CustomDatabase {
  public: {
    Tables: {
      user_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          details: any;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          details?: any;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          details?: any;
          is_public?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
