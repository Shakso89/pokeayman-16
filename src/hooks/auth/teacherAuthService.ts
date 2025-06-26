
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { checkIsAdmin, isSpecialAdminEmail } from './adminUtils';
import { setupTeacherAuth } from './teacherAuth';
import { AuthState } from './types';

// Simplified teacher login handler
export const handleTeacherLogin = async (
  usernameOrEmail: string,
  password: string,
  updateAuthState: (newState: Partial<AuthState>) => void
): Promise<{ success: boolean; redirect: string; message?: string }> => {
  try {
    console.log("Teacher login attempt for:", usernameOrEmail);

    const isLoginAnEmail = usernameOrEmail.includes('@');
    let emailToLogin = isLoginAnEmail ? usernameOrEmail.toLowerCase() : '';
    let resolvedUsername = isLoginAnEmail ? usernameOrEmail.split('@')[0] : usernameOrEmail;

    // Step 1: Resolve username to email if necessary
    if (!isLoginAnEmail) {
      const usernameLower = usernameOrEmail.toLowerCase();
      if (usernameLower === 'ayman' || usernameLower === 'admin') {
        // For admin, use canonical email
        emailToLogin = 'ayman.soliman.tr@gmail.com'; 
        resolvedUsername = 'Ayman';
      } else {
        const { data: teacher, error } = await supabase
          .from('teachers')
          .select('email')
          .ilike('username', usernameOrEmail)
          .single();

        if (error || !teacher?.email) {
          console.error('Could not find email for username:', usernameOrEmail);
          return { success: false, redirect: "", message: `Username "${usernameOrEmail}" not found.` };
        }
        emailToLogin = teacher.email;
        resolvedUsername = usernameOrEmail;
      }
    }
    
    console.log(`Attempting login with email: ${emailToLogin}`);

    // Step 2: Try database authentication first
    const { data: teacher, error: dbError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', emailToLogin)
      .single();

    if (teacher && !dbError) {
      // Verify password (simple check - in production use proper hashing)
      if (teacher.password !== password) {
        return { success: false, redirect: "", message: "Invalid password" };
      }

      if (!teacher.is_active || teacher.is_frozen) {
        return { success: false, redirect: "", message: "Account is inactive" };
      }

      // Update last login
      await supabase
        .from('teachers')
        .update({ last_login: new Date().toISOString() })
        .eq('id', teacher.id);

      // Set session data
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "teacher");
      localStorage.setItem("teacherId", teacher.id);
      localStorage.setItem("teacherUsername", teacher.username);
      localStorage.setItem("userEmail", teacher.email);
      
      const isAdmin = teacher.role === 'owner' || checkIsAdmin(null, resolvedUsername);
      localStorage.setItem("isAdmin", isAdmin.toString());

      return { 
        success: true, 
        redirect: isAdmin ? "/admin-dashboard" : "/teacher-dashboard" 
      };
    }

    // Step 3: Fallback to Supabase Auth if database auth fails
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (authError) {
      return { success: false, redirect: "", message: authError.message };
    }

    if (!authData?.user) {
      return { success: false, redirect: "", message: "Login failed, please try again." };
    }

    // Setup session for Supabase auth user
    const user = authData.user;
    const finalIsAdmin = checkIsAdmin(user, resolvedUsername);
    
    setupTeacherAuth(user.id, {
      username: resolvedUsername,
      email: user.email,
      ...user.user_metadata
    }, updateAuthState, finalIsAdmin);

    return { 
      success: true, 
      redirect: finalIsAdmin ? "/admin-dashboard" : "/teacher-dashboard" 
    };

  } catch (error: any) {
    console.error("Teacher login process failed:", error);
    return { 
      success: false, 
      redirect: "", 
      message: "Login failed. Please try again." 
    };
  }
};
