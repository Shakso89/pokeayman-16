
export type Student = {
  id: string;
  username: string;
  password: string;
  email?: string; // Added email field
  display_name: string | null;
  teacher_id: string | null;
  class_id: string | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
};

export type Teacher = {
  id: string;
  username: string;
  email: string | null;
  display_name: string;
  password: string;
  is_active: boolean;
  subscription_type: string | null;
  expiry_date: string | null;
  created_at: string;
  last_login: string | null;
};

export type Class = {
  id: string;
  name: string;
  teacher_id: string | null;
  created_at: string;
};
