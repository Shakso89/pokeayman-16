
import { Session, User } from '@supabase/supabase-js';

export type UserType = 'teacher' | 'student' | 'admin' | null;

export interface AuthState {
  isLoggedIn: boolean;
  userType: UserType;
  userId: string | null;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
}
