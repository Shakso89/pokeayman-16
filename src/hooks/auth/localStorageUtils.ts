
import { UserType, AuthState } from './types';
import { ADMIN_EMAILS, ADMIN_USERNAMES, AUTH_STORAGE_KEYS } from './constants';

// Load auth state from localStorage (fallback method)
export const loadFromLocalStorage = (): Partial<AuthState> | null => {
  const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const localUserType = localStorage.getItem("userType") as UserType;
  const teacherUsername = localStorage.getItem("teacherUsername");
  const isAdmin = localStorage.getItem("isAdmin") === "true" || 
                 ADMIN_USERNAMES.includes(teacherUsername || '') ||
                 ADMIN_EMAILS.includes(localStorage.getItem("userEmail")?.toLowerCase() || '');

  if (localIsLoggedIn && localUserType) {
    const userId = localUserType === "teacher"
      ? localStorage.getItem("teacherId")
      : localStorage.getItem("studentId");
    
    console.log("Auth state loaded from localStorage:", { 
      userType: localUserType, 
      isAdmin: isAdmin
    });
    
    return {
      isLoggedIn: true,
      userType: localUserType,
      userId,
      isAdmin: isAdmin
    };
  }
  
  return null;
};

// Clear all auth-related localStorage items
export const clearLocalStorage = (): void => {
  AUTH_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  console.log("Auth localStorage cleared");
};
