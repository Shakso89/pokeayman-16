
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';
import { checkIsAdmin, isSpecialAdminEmail } from './adminUtils';
import { setupStudentAuth } from './studentAuth';
import { setupTeacherAuth } from './teacherAuth';

// Handle changes in authentication session
export const handleSession = async (
  newSession: Session | null,
  updateAuthState: (newState: Partial<AuthState>) => void,
  clearAuthState: () => void
): Promise<void> => {
  try {
    // If no session, clear auth state
    if (!newSession || !newSession.user) {
      clearAuthState();
      return;
    }
    
    // Set session and user in state
    updateAuthState({
      session: newSession,
      user: newSession.user
    });
    
    const currentUser = newSession.user;
    const userData = currentUser.user_metadata || {};
    const username = userData.username || localStorage.getItem("teacherUsername");
    
    // Store email in localStorage for reference
    if (currentUser.email) {
      localStorage.setItem("userEmail", currentUser.email);
      
      // Special handling for admin emails that were previously getting stuck
      if (isSpecialAdminEmail(currentUser.email)) {
        console.log("Special admin email detected:", currentUser.email);
        setupTeacherAuth(
          currentUser.id, 
          { username: "Ayman", email: currentUser.email },
          updateAuthState,
          true
        );
        return;
      }
    }
    
    // Check if user is admin
    const isAdminUser = checkIsAdmin(currentUser, username);
    
    // For admin users, set up as teacher type
    if (isAdminUser) {
      setupTeacherAuth(
        currentUser.id, 
        {
          username: username || currentUser.email?.split('@')[0] || 'Admin',
          email: currentUser.email
        },
        updateAuthState,
        true
      );
      return;
    }
    
    // Determine if user is student or teacher
    const userTypeFromMeta = userData.user_type as 'teacher' | 'student' | 'admin' | null;
    
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
