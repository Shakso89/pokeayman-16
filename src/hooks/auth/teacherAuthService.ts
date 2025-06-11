
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { checkIsAdmin, isSpecialAdminEmail } from './adminUtils';
import { setupTeacherAuth } from './teacherAuth';
import { AuthState } from './types';

// Generate a unique teacher ID
const generateTeacherId = (): string => {
  return `teacher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Unified teacher login handler with improved error handling
export const handleTeacherLogin = async (
  username: string,
  password: string,
  updateAuthState: (newState: Partial<AuthState>) => void
): Promise<{ success: boolean; redirect: string; message?: string }> => {
  try {
    console.log("Teacher login attempt:", username);

    // Check if this is an admin login first
    const isAdminUser = checkIsAdmin(null, username) || 
                       isSpecialAdminEmail(username) ||
                       username.toLowerCase() === "ayman" ||
                       username.toLowerCase() === "admin";

    const isEmail = username.includes("@");
    const email = isEmail ? username.toLowerCase() : `${username.toLowerCase()}@pokeayman.com`;

    // Try the new database function first for unified login
    try {
      const { data: loginData, error: loginError } = await supabase
        .rpc('get_teacher_by_login', { login_input: username });

      if (!loginError && loginData && loginData.length > 0) {
        const teacher = loginData[0];
        console.log("Found teacher via unified login:", teacher.username);
        
        if (teacher.password === password) {
          setupTeacherAuth(teacher.id, {
            username: teacher.username,
            email: teacher.email,
            display_name: teacher.display_name
          }, updateAuthState, teacher.role === 'owner' || isAdminUser);

          toast({ 
            title: "Success!", 
            description: `Welcome back, ${teacher.display_name || teacher.username}!` 
          });
          
          return { 
            success: true, 
            redirect: (teacher.role === 'owner' || isAdminUser) ? "/admin-dashboard" : "/teacher-dashboard" 
          };
        } else {
          return { success: false, redirect: "", message: "Invalid password" };
        }
      }
    } catch (dbError) {
      console.log("Database function not available, trying Supabase auth");
    }

    // Try Supabase authentication with timeout
    const authPromise = supabase.auth.signInWithPassword({
      email,
      password
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Authentication timeout")), 8000);
    });

    const { data, error: authError } = await Promise.race([authPromise, timeoutPromise]) as any;

    if (authError) {
      // If Supabase auth fails, try localStorage fallback for existing users
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacher = teachers.find((t: any) => 
        t.username.toLowerCase() === username.toLowerCase() || 
        t.email?.toLowerCase() === username.toLowerCase()
      );

      if (teacher && teacher.password === password) {
        // Ensure teacher has an ID
        if (!teacher.id) {
          teacher.id = generateTeacherId();
          // Update the teachers array
          const updatedTeachers = teachers.map((t: any) => 
            (t.username === teacher.username) ? teacher : t
          );
          localStorage.setItem("teachers", JSON.stringify(updatedTeachers));
        }

        setupTeacherAuth(teacher.id, teacher, updateAuthState, teacher.isAdmin || isAdminUser);

        toast({ 
          title: "Success!", 
          description: `Welcome back, ${teacher.username}!` 
        });
        
        return { 
          success: true, 
          redirect: teacher.isAdmin || isAdminUser ? "/admin-dashboard" : "/teacher-dashboard" 
        };
      }

      return { 
        success: false, 
        redirect: "", 
        message: authError.message || "Invalid credentials" 
      };
    }

    // Supabase authentication successful
    const user = data.user;
    const userMetadata = user.user_metadata;
    const teacherId = user.id;
    const displayUsername = userMetadata.username || username.split('@')[0] || 'Teacher';

    // Check if user is admin
    const finalIsAdmin = isAdminUser || checkIsAdmin(user, displayUsername);

    setupTeacherAuth(teacherId, {
      username: displayUsername,
      email: user.email,
      ...userMetadata
    }, updateAuthState, finalIsAdmin);

    toast({ 
      title: "Success!", 
      description: `Welcome back, ${displayUsername}!` 
    });

    return { 
      success: true, 
      redirect: finalIsAdmin ? "/admin-dashboard" : "/teacher-dashboard" 
    };

  } catch (error: any) {
    console.error("Teacher login error:", error);
    const errorMessage = error.message === "Authentication timeout" 
      ? "Login timeout - please try again" 
      : "Invalid credentials";
    
    return { 
      success: false, 
      redirect: "", 
      message: errorMessage 
    };
  }
};

// Handle special admin cases with enhanced detection
export const handleAdminLogin = async (
  username: string,
  password: string,
  updateAuthState: (newState: Partial<AuthState>) => void
): Promise<{ success: boolean; redirect: string; message?: string }> => {
  try {
    const email = username.includes("@") ? username.toLowerCase() : 
                  username.toLowerCase() === "ayman" ? "ayman@pokeayman.com" : 
                  `${username.toLowerCase()}@pokeayman.com`;
    const displayUsername = username.includes("ayman") || username === "Ayman" ? "Ayman" : "Admin";

    console.log(`Admin login attempt for: ${email}`);

    // Try to sign in with Supabase first with timeout
    const authPromise = supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Authentication timeout")), 8000);
    });

    try {
      const { data, error: signInError } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (signInError) {
        console.log("Admin signin failed, attempting signup:", signInError.message);
        
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: displayUsername,
              user_type: "teacher",
              is_admin: true,
            },
          },
        });

        if (signUpError) {
          return { 
            success: false, 
            redirect: "", 
            message: signUpError.message 
          };
        }
      }

      // Generate teacher ID if needed
      const teacherId = data?.user?.id || generateTeacherId();

      setupTeacherAuth(teacherId, {
        username: displayUsername,
        email: email
      }, updateAuthState, true);

      toast({ 
        title: "Success!", 
        description: `Welcome back, ${displayUsername}!` 
      });
      
      return { success: true, redirect: "/admin-dashboard" };
    } catch (timeoutError) {
      return { 
        success: false, 
        redirect: "", 
        message: "Login timeout - please try again" 
      };
    }
  } catch (err: any) {
    console.error("Admin login failed:", err);
    return { 
      success: false, 
      redirect: "", 
      message: err.message || "Admin login failed" 
    };
  }
};
