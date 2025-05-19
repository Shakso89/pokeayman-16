
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

// Set up a student's authentication state
export const setupStudentAuth = (
  id: string,
  data: any,
  updateAuthState: (newState: Partial<AuthState>) => void
): void => {
  // Update state
  updateAuthState({
    isLoggedIn: true,
    userType: "student",
    userId: id,
    isAdmin: false
  });

  // Update localStorage
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userType", "student");
  localStorage.setItem("studentId", id);
  localStorage.setItem("studentDisplayName", data.display_name || data.username || "");
  if (data.class_id) localStorage.setItem("studentClassId", data.class_id);
  
  console.log("Student auth setup complete", { id, displayName: data.display_name || data.username });
};

// Clear all authentication state
export const clearAuthState = (
  updateAuthState: (newState: Partial<AuthState>) => void
): void => {
  updateAuthState({
    isLoggedIn: false,
    userType: null,
    userId: null,
    session: null,
    user: null,
    isAdmin: false
  });

  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userType");
  localStorage.removeItem("teacherId");
  localStorage.removeItem("studentId");
  localStorage.removeItem("teacherUsername");
  localStorage.removeItem("studentDisplayName");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("studentClassId");
  localStorage.removeItem("userEmail");
  
  console.log("Auth state cleared");
};

// Load auth state from localStorage (fallback method)
export const loadFromLocalStorage = (
  updateAuthState: (newState: Partial<AuthState>) => void
): boolean => {
  const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const localUserType = localStorage.getItem("userType") as 'teacher' | 'student' | 'admin' | null;
  const teacherUsername = localStorage.getItem("teacherUsername");
  const isAdmin = localStorage.getItem("isAdmin") === "true" || 
                 checkIsAdmin(null, teacherUsername || '');

  if (localIsLoggedIn && localUserType) {
    const userId = localUserType === "teacher"
      ? localStorage.getItem("teacherId")
      : localStorage.getItem("studentId");
    
    updateAuthState({
      isLoggedIn: true,
      userType: localUserType,
      userId,
      isAdmin: isAdmin
    });
    
    console.log("Auth state loaded from localStorage:", { 
      userType: localUserType, 
      isAdmin: isAdmin
    });
    
    return true;
  }
  
  return false;
};
