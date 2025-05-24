
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { AuthState, UserType } from './types';
import { checkIsAdmin, isSpecialAdminEmail } from './adminUtils';
import { setupStudentAuth } from './studentAuth';
import { setupTeacherAuth } from './teacherAuth';

// Handle authentication session
export const handleSession = async (
  newSession: Session | null,
  updateAuthState: (newState: Partial<AuthState>) => void,
  clearAuthStateFn: () => void
): Promise<void> => {
  try {
    if (!newSession || !newSession.user) {
      clearAuthStateFn();
      return;
    }
    
    const currentUser = newSession.user;
    const userData = currentUser.user_metadata || {};
    const username = userData.username || localStorage.getItem("teacherUsername");
    
    // Check if user is admin
    const isAdminUser = checkIsAdmin(currentUser, username);
    
    // Store email in localStorage for reference
    if (currentUser.email) {
      localStorage.setItem("userEmail", currentUser.email);
      
      // Special handling for admin emails that were previously getting stuck
      if (isSpecialAdminEmail(currentUser.email)) {
        console.log("Special admin email detected:", currentUser.email);
        setupTeacherAuth(currentUser.id, {
          username: "Ayman", 
          email: currentUser.email
        }, updateAuthState, true);
        return;
      }
    }
    
    // For admin users, set up as teacher type
    if (isAdminUser) {
      setupTeacherAuth(currentUser.id, {
        username: username || currentUser.email?.split('@')[0] || 'Admin',
        email: currentUser.email
      }, updateAuthState, true);
      return;
    }
    
    // Determine if user is student or teacher
    const userTypeFromMeta = userData.user_type as UserType;
    
    if (userTypeFromMeta === "student") {
      setupStudentAuth(currentUser.id, userData, updateAuthState);
    } else {
      // Check database for student record
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (studentData) {
        setupStudentAuth(currentUser.id, studentData, updateAuthState);
      } else {
        setupTeacherAuth(currentUser.id, userData, updateAuthState, false);
      }
    }
  } catch (error) {
    console.error("Error in handleSession:", error);
    
    // Try to recover with basic session data
    if (newSession?.user) {
      const sessionUser = newSession.user;
      const isAdminUser = checkIsAdmin(sessionUser);
      
      updateAuthState({
        isLoggedIn: true,
        userType: isAdminUser ? "teacher" : "teacher", // Default to teacher
        userId: sessionUser.id,
        session: newSession,
        user: sessionUser,
        isAdmin: isAdminUser
      });
    }
  }
};
