
import { User } from '@supabase/supabase-js';
import { AuthState } from './types';
import { checkIsAdmin } from './adminUtils';

// Set up a teacher's authentication state
export const setupTeacherAuth = (
  id: string,
  userData: any,
  updateAuthState: (newState: Partial<AuthState>) => void,
  isAdminUser: boolean = false
): void => {
  // If explicitly passed isAdmin flag, use that, otherwise check
  const isAdmin = typeof isAdminUser === 'boolean' 
    ? isAdminUser 
    : checkIsAdmin(null, userData.username);
  
  // Update state
  updateAuthState({
    isLoggedIn: true,
    userType: "teacher",
    userId: id,
    isAdmin: isAdmin
  });

  // Update localStorage with consistent values
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userType", "teacher");
  localStorage.setItem("teacherId", id);
  localStorage.setItem(
    "teacherUsername",
    userData.username || userData.email?.split("@")[0] || ""
  );

  if (isAdmin) localStorage.setItem("isAdmin", "true");
  
  console.log("Teacher auth setup complete", { id, isAdmin: isAdmin });
};
