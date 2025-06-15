
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { checkIsAdmin, isSpecialAdminEmail } from './adminUtils';
import { setupTeacherAuth } from './teacherAuth';
import { AuthState } from './types';

// Unified teacher login handler with improved error handling and identity consolidation
export const handleTeacherLogin = async (
  usernameOrEmail: string,
  password: string,
  updateAuthState: (newState: Partial<AuthState>) => void
): Promise<{ success: boolean; redirect: string; message?: string }> => {
  try {
    console.log("Unified teacher login attempt for:", usernameOrEmail);

    const isLoginAnEmail = usernameOrEmail.includes('@');
    let emailToLogin = isLoginAnEmail ? usernameOrEmail.toLowerCase() : '';
    let resolvedUsername = isLoginAnEmail ? usernameOrEmail.split('@')[0] : usernameOrEmail;

    // Step 1: Resolve username to email if necessary
    if (!isLoginAnEmail) {
      const usernameLower = usernameOrEmail.toLowerCase();
      if (usernameLower === 'ayman' || usernameLower === 'admin') {
        // For owner/admin, we can use a canonical email. Let's try to find a real one first.
        const { data: adminTeacher } = await supabase
            .from('teachers')
            .select('email')
            .in('username', ['Ayman', 'Admin', 'ayman', 'admin'])
            .not('email', 'is', null)
            .limit(1)
            .single();
        
        if (adminTeacher?.email) {
            emailToLogin = adminTeacher.email;
        } else {
            // Fallback to a known owner email if no record found in DB.
            emailToLogin = 'ayman.soliman.tr@gmail.com'; 
            console.log(`Username '${usernameOrEmail}' resolved to canonical admin email.`);
        }
        resolvedUsername = 'Ayman';
      } else {
        const { data: teacher, error } = await supabase
          .from('teachers')
          .select('email')
          .ilike('username', usernameOrEmail)
          .single();

        if (error || !teacher?.email) {
          console.error('Could not find email for username:', usernameOrEmail, error);
          return { success: false, redirect: "", message: `Username "${usernameOrEmail}" not found or has no associated email.` };
        }
        emailToLogin = teacher.email;
        resolvedUsername = usernameOrEmail;
      }
    }
    
    console.log(`Attempting Supabase login with email: ${emailToLogin}`);

    // Step 2: Authenticate with Supabase Auth - the single source of truth
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    // If sign-in fails for an admin, try to sign them up. This allows first-time admin login.
    const isAdminUser = checkIsAdmin(null, resolvedUsername) || isSpecialAdminEmail(emailToLogin);
    if (authError && isAdminUser) {
      console.log("Admin sign-in failed, attempting sign-up...", authError.message);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: emailToLogin,
        password,
        options: {
          data: {
            username: resolvedUsername,
            user_type: "teacher",
            is_admin: true,
          }
        }
      });

      if (signUpError) {
        // If signup also fails (e.g., user exists but password wrong), return original auth error
        return { success: false, redirect: "", message: authError.message };
      }
      // After successful signup, we need to sign in again to get a session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailToLogin,
          password,
      });

      if (signInError) {
          return { success: false, redirect: "", message: signInError.message };
      }
      authData = signInData;

    } else if (authError) {
      return { success: false, redirect: "", message: authError.message };
    }

    if (!authData?.user) {
      return { success: false, redirect: "", message: "Login failed, please try again." };
    }

    // Step 3: Setup session using the canonical user ID from Supabase Auth
    const user = authData.user;
    const finalIsAdmin = checkIsAdmin(user, resolvedUsername);
    
    setupTeacherAuth(user.id, {
      username: resolvedUsername,
      email: user.email,
      ...user.user_metadata
    }, updateAuthState, finalIsAdmin);

    toast({ 
      title: "Success!", 
      description: `Welcome back, ${user.user_metadata?.displayName || resolvedUsername}!` 
    });

    return { 
      success: true, 
      redirect: finalIsAdmin ? "/admin-dashboard" : "/teacher-dashboard" 
    };

  } catch (error: any) {
    console.error("Unified teacher login process failed:", error);
    return { 
      success: false, 
      redirect: "", 
      message: error.message || "An unexpected error occurred." 
    };
  }
};
