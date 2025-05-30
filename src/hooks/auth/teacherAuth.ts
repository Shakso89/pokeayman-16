
import { User } from '@supabase/supabase-js';
import { AuthState } from './types';
import { checkIsAdmin } from './adminUtils';

// Generate a unique teacher ID if one doesn't exist
const ensureTeacherId = (id?: string): string => {
  if (id) return id;
  return `teacher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Set up a teacher's authentication state
export const setupTeacherAuth = (
  id: string,
  userData: any,
  updateAuthState: (newState: Partial<AuthState>) => void,
  isAdminUser: boolean = false
): void => {
  // Ensure we have a valid teacher ID
  const teacherId = ensureTeacherId(id);
  
  // If explicitly passed isAdmin flag, use that, otherwise check
  const isAdmin = typeof isAdminUser === 'boolean' 
    ? isAdminUser 
    : checkIsAdmin(null, userData.username);
  
  // Update state
  updateAuthState({
    isLoggedIn: true,
    userType: "teacher",
    userId: teacherId,
    isAdmin: isAdmin
  });

  // Update localStorage with consistent values
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userType", "teacher");
  localStorage.setItem("teacherId", teacherId);
  localStorage.setItem(
    "teacherUsername",
    userData.username || userData.email?.split("@")[0] || ""
  );

  if (isAdmin) localStorage.setItem("isAdmin", "true");
  
  console.log("Teacher auth setup complete", { 
    id: teacherId, 
    isAdmin: isAdmin,
    username: userData.username 
  });
};
