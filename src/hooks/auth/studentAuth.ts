
import { AuthState } from './types';

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
