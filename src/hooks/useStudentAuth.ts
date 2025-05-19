
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define StudentData interface for the return type that differs from database Student type
interface StudentData {
  id: string;
  username: string;
  display_name: string | null;
  avatar?: string;
  photos?: string[];
  class_id?: string | null;
  teacher_id?: string | null;
  teacher_name?: string;
  school_name?: string;
}

interface LoginResult {
  success: boolean;
  student: StudentData | null;
  message?: string;
}

export const useStudentAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const loginStudent = async (username: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    
    // Create a timeout promise to prevent infinite waiting
    const timeoutPromise = new Promise<LoginResult>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Login request timed out. Please try again."));
      }, 10000); // 10 second timeout
    });
    
    try {
      console.log("Attempting to login student with username:", username);
      
      // Race between actual login and timeout
      const result = await Promise.race([
        tryDatabaseLogin(username, password),
        timeoutPromise
      ]);
      
      if (result.success) {
        return result;
      }
      
      // If database login fails, try legacy login
      console.log("Student not found in database, trying legacy login");
      return await Promise.race([
        legacyLoginStudent(username, password),
        timeoutPromise
      ]);
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
  
  // Database login function
  const tryDatabaseLogin = async (username: string, password: string): Promise<LoginResult> => {
    // Get student data from Supabase
    const { data: student, error } = await supabase
      .from('students')
      .select(`
        id,
        username,
        password_hash,
        display_name,
        class_id,
        teacher_id,
        is_active,
        created_at
      `)
      .eq('username', username)
      .maybeSingle();
    
    // Handle database query error
    if (error) {
      console.error("Database query error:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log("Student login query result:", student ? "Found student" : "No student found");
    
    // If no student found with that username
    if (!student) {
      return { success: false, student: null };
    }
    
    // Simple password comparison (avoid bcryptjs on browser)
    const passwordValid = student.password_hash === password;
    
    console.log("Password validation result:", passwordValid ? "Valid" : "Invalid");
    
    if (!passwordValid) {
      throw new Error("Invalid username or password");
    }
    
    if (!student.is_active) {
      throw new Error("Your account has been deactivated. Please contact your teacher.");
    }
    
    // Get teacher name if teacher_id is available
    const teacherName = await getTeacherName(student.teacher_id);
    
    // Update last login time
    await updateLastLogin(student.id);
    
    // Create student data object
    const studentData = createStudentData(student, teacherName);
    
    // Set session data in localStorage
    setStudentSession(student);
    
    // Show success toast
    toast({
      title: "Login Successful",
      description: `Welcome back, ${student.display_name || student.username}!`,
    });
    
    return { success: true, student: studentData };
  };
  
  // Legacy login function using localStorage
  const legacyLoginStudent = async (username: string, password: string): Promise<LoginResult> => {
    try {
      console.log("Attempting legacy login with localStorage");
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const student = students.find((s: any) => s.username === username && s.password === password);
      
      if (!student) {
        console.log("Student not found in localStorage");
        throw new Error("Invalid username or password");
      }
      
      console.log("Student found in localStorage, migrating to database");
      
      // Try to migrate student to database
      await migrateStudentToDatabase(student, password);
      
      // Set session data in localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", "student");
      localStorage.setItem("studentId", student.id);
      localStorage.setItem("studentName", student.display_name || student.username);
      localStorage.setItem("studentDisplayName", student.display_name || student.username);
      if (student.classId) localStorage.setItem("studentClassId", student.classId);
      if (student.class_id) localStorage.setItem("studentClassId", student.class_id);
      
      console.log("Legacy login successful");
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${student.display_name || student.username}!`,
      });
      
      return {
        success: true,
        student: {
          id: student.id,
          username: student.username,
          display_name: student.display_name || student.username,
          class_id: student.classId || student.class_id,
          teacher_id: student.teacherId || student.teacher_id,
          teacher_name: "Unknown"
        }
      };
    } catch (error: any) {
      console.error("Legacy login error:", error);
      return { success: false, student: null, message: error.message || "Login error" };
    }
  };
  
  // Helper functions
  const getTeacherName = async (teacherId: string | null): Promise<string> => {
    if (!teacherId) return "Unknown";
    
    const { data: teacher } = await supabase
      .from('teachers')
      .select('display_name, username')
      .eq('id', teacherId)
      .maybeSingle();
      
    return teacher ? (teacher.display_name || teacher.username) : "Unknown";
  };
  
  const updateLastLogin = async (studentId: string): Promise<void> => {
    await supabase
      .from('students')
      .update({ last_login: new Date().toISOString() })
      .eq('id', studentId);
  };
  
  const createStudentData = (student: any, teacherName: string): StudentData => {
    return {
      id: student.id,
      username: student.username,
      display_name: student.display_name || student.username,
      class_id: student.class_id,
      teacher_id: student.teacher_id,
      teacher_name: teacherName,
      school_name: "Unknown" // This was hardcoded in the original code
    };
  };
  
  const setStudentSession = (student: any): void => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", "student");
    localStorage.setItem("studentId", student.id);
    localStorage.setItem("studentName", student.display_name || student.username);
    localStorage.setItem("studentDisplayName", student.display_name || student.username);
    if (student.class_id) localStorage.setItem("studentClassId", student.class_id);
  };
  
  const migrateStudentToDatabase = async (student: any, password: string): Promise<void> => {
    try {
      // Use regular password as hash for now (avoiding bcryptjs in browser)
      const hashedPassword = password;
      
      // Create a new unique ID if one doesn't exist
      const newId = student.id || crypto.randomUUID();
      
      // Create a DB student object
      const newStudent = {
        id: newId,
        username: student.username,
        password_hash: hashedPassword,
        display_name: student.display_name || student.username,
        teacher_id: student.teacherId || student.teacher_id,
        class_id: student.classId || student.class_id,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      // First check if the student already exists in the database by ID or username
      const { data: existingStudent, error: checkError } = await supabase
        .from('students')
        .select('id')
        .or(`id.eq.${newStudent.id},username.eq.${newStudent.username}`)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking existing student:", checkError);
      }
      
      if (!existingStudent) {
        // Insert the new student
        const { data, error } = await supabase
          .from('students')
          .insert(newStudent)
          .select();
          
        if (error) {
          console.error("Error migrating student to database:", error);
        } else if (data) {
          console.log("Migrated student to database:", data[0].id);
        }
      } else {
        // Update the existing student
        const { error } = await supabase
          .from('students')
          .update({
            password_hash: hashedPassword,
            display_name: newStudent.display_name,
            teacher_id: newStudent.teacher_id,
            class_id: newStudent.class_id,
            last_login: newStudent.last_login
          })
          .eq('id', existingStudent.id);
          
        if (error) {
          console.error("Error updating existing student:", error);
        } else {
          console.log("Updated existing student in database:", existingStudent.id);
        }
      }
    } catch (err) {
      console.error("Error migrating student to database:", err);
    }
  };
  
  return {
    isLoading,
    loginStudent
  };
};
