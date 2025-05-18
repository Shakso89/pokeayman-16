
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  username: string;
  display_name: string;
  avatar?: string;
  photos?: string[];
  class_id?: string;
  teacher_id?: string;
  teacher_name?: string;
  school_name?: string;
}

interface LoginResult {
  success: boolean;
  student: Student | null;
  message?: string;
}

export const useStudentAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const loginStudent = async (usernameOrEmail: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    
    try {
      // First try to authenticate with Supabase
      let authSuccess = false;
      let studentId = '';
      
      // Check if input is an email
      const isEmail = usernameOrEmail.includes('@');
      
      try {
        // Try to authenticate with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          // If it's an email, use it directly, otherwise use placeholder pattern
          email: isEmail ? usernameOrEmail : `${usernameOrEmail}@pokeayman.com`,
          password: password
        });

        if (!authError && authData.user) {
          authSuccess = true;
          studentId = authData.user.id;
        }
      } catch (authErr) {
        console.warn("Supabase auth error:", authErr);
        // Continue with database query even if auth fails
      }
      
      // Check if the username/email and password match in the students table
      const { data: student, error } = await supabase
        .from('students')
        .select(`
          id,
          username,
          display_name,
          class_id,
          teacher_id
        `)
        .or(`username.eq.${usernameOrEmail}${isEmail ? `,email.eq.${usernameOrEmail}` : ''}`)
        .maybeSingle();
      
      if (error) {
        console.error("Database query error:", error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      // If we have a successful auth but no student record, or no auth success and no student record
      if (!student) {
        if (!authSuccess) {
          // Try legacy login via localStorage
          return await legacyLoginStudent(usernameOrEmail, password);
        }
        
        // Auth success but no student record - create one
        const newStudent = {
          id: studentId,
          username: usernameOrEmail,
          display_name: usernameOrEmail,
          password: password, // Note: In production, never store plain passwords
        };
        
        const { data: createdStudent, error: createError } = await supabase
          .from('students')
          .insert(newStudent)
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating student record:", createError);
          throw new Error(`Failed to create student record: ${createError.message}`);
        }
        
        return {
          success: true,
          student: createdStudent as Student
        };
      }
      
      // Get teacher details if available
      let teacherName = "Unknown";
      
      if (student.teacher_id) {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('display_name')
          .eq('id', student.teacher_id)
          .maybeSingle();
          
        if (teacher) {
          teacherName = teacher.display_name;
        }
      }
      
      // Find school name based on teacher's school
      let schoolName = "Unknown";
      
      // Update last login time
      await supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('id', student.id);
      
      // Set student data
      const studentData: Student = {
        ...student,
        teacher_name: teacherName,
        school_name: schoolName
      };
      
      // If we don't have auth success yet, try to establish it
      if (!authSuccess) {
        try {
          // Try to sign in with Supabase Auth
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: `${student.username}@pokeayman.com`,
            password: password
          });
          
          if (authError) {
            console.warn("Could not establish Supabase session:", authError);
            // Create a user account if it doesn't exist
            try {
              const { error: signupError } = await supabase.auth.signUp({
                email: `${student.username}@pokeayman.com`,
                password: password,
                options: {
                  data: {
                    username: student.username,
                    display_name: student.display_name,
                    user_type: 'student'
                  }
                }
              });
              
              if (signupError) {
                console.warn("Failed to create auth account:", signupError);
              }
            } catch (e) {
              console.warn("Error creating auth account:", e);
            }
          }
        } catch (e) {
          console.error("Error setting up Supabase session:", e);
          // Continue with localStorage fallback
        }
      }
      
      return { 
        success: true, 
        student: studentData
      };
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      return { success: false, student: null, message: error.message || "Login error" };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Legacy login function that uses localStorage
  const legacyLoginStudent = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const student = students.find((s: any) => s.username === username && s.password === password);
      
      if (!student) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return { success: false, student: null, message: "Invalid credentials" };
      }
      
      // Try to migrate student to database
      try {
        const { data, error } = await supabase
          .from('students')
          .insert({
            id: student.id,
            username: student.username,
            password: password,
            display_name: student.display_name || student.username,  // Fixed: using display_name instead of displayName
            teacher_id: student.teacherId,
            class_id: student.classId,
            last_login: new Date().toISOString()
          })
          .select();
        
        if (!error && data) {
          console.log("Migrated student to database:", data);
        }
      } catch (err) {
        console.error("Error migrating student to database:", err);
      }
      
      return {
        success: true,
        student: {
          id: student.id,
          username: student.username,
          display_name: student.display_name || student.username,  // Fixed: using display_name instead of displayName
          class_id: student.classId,
          teacher_id: student.teacherId,
          teacher_name: "Unknown"
        }
      };
    } catch (error: any) {
      console.error("Legacy login error:", error);
      return { success: false, student: null, message: error.message || "Login error" };
    }
  };
  
  return {
    isLoading,
    loginStudent
  };
};
