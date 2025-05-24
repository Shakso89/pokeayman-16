
import { AuthState } from './types';
import { checkIsAdmin } from './adminUtils';

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
