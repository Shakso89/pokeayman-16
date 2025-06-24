
export interface TeacherProfile {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
  school_id?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
  photos?: string[];
  social_links?: {
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    line?: string;
  };
}
