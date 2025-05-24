
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { AuthState, UserType } from './types';
import { checkIsAdmin, isSpecialAdminEmail } from './adminUtils';
import { setupStudentAuth, setupTeacherAuth } from './authStateManagement';

// Handle authentication session
export const handleSession = async (
  newSession: Session | null,
  updateAuthState: (newState: Partial<AuthState>) => void,
  clearAuthState: () => void
): Promise<void> => {
  try {
    if (!newSession || !newSession.user) {
      clearAuthState();
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
        }, true);
        updateAuthState({
          isLoggedIn: true,
          userType: "teacher",
          userId: currentUser.id,
          session: newSession,
          user: currentUser,
          isAdmin: true
        });
        return;
      }
    }
    
    // For admin users, set up as teacher type
    if (isAdminUser) {
      setupTeacherAuth(currentUser.id, {
        username: username || currentUser.email?.split('@')[0] || 'Admin',
        email: currentUser.email
      }, true);
      updateAuthState({
        isLoggedIn: true,
        userType: "teacher",
        userId: currentUser.id,
        session: newSession,
        user: currentUser,
        isAdmin: true
      });
      return;
    }
    
    // Determine if user is student or teacher
    const userTypeFromMeta = userData.user_type as UserType;
    
    if (userTypeFromMeta === "student") {
      setupStudentAuth(currentUser.id, userData);
      updateAuthState({
        isLoggedIn: true,
        userType: "student",
        userId: currentUser.id,
        session: newSession,
        user: currentUser,
        isAdmin: false
      });
    } else {
      // Check database for student record
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (studentData) {
        setupStudentAuth(currentUser.id, studentData);
        updateAuthState({
          isLoggedIn: true,
          userType: "student",
          userId: currentUser.id,
          session: newSession,
          user: currentUser,
          isAdmin: false
        });
      } else {
        setupTeacherAuth(currentUser.id, userData, false);
        updateAuthState({
          isLoggedIn: true,
          userType: "teacher",
          userId: currentUser.id,
          session: newSession,
          user: currentUser,
          isAdmin: false
        });
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

// Simplified logout function
export const performLogout = async (): Promise<boolean> => {
  try {
    console.log("Starting logout process...");

    // Sign out from Supabase (don't wait for it)
    supabase.auth.signOut().catch((error) => {
      console.error("Supabase signout error (ignored):", error);
    });

    console.log("Logout completed successfully");
    return true;
  } catch (error: any) {
    console.error("Logout error:", error);
    return true; // Return true even on error to allow redirect
  }
};
