import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getValidUUID } from "./studentUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { Student } from "@/types/database";
import bcrypt from "bcryptjs";

interface StudentData {
  username: string;
  password: string;
  displayName: string;
  schoolId: string;
}

export const createStudent = async (
  studentData: StudentData,
  teacherId: string | null,
  t: ReturnType<typeof useTranslation>["t"]
) => {
  console.log("Creating student with data:", { ...studentData, password: "[REDACTED]" });
  
  // Validate student data
  if (!studentData.username || !studentData.password || !studentData.displayName || !studentData.schoolId) {
    const errorMessage = t("fill-all-fields") || "Please fill all required fields including school selection";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    });
    throw new Error(errorMessage);
  }
  
  if (!teacherId) {
    const errorMessage = "Teacher ID is missing";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    });
    throw new Error(errorMessage);
  }

  try {
    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('students')
      .select('username')
      .eq('username', studentData.username)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking for existing username:", checkError);
    }
    
    if (existingUser) {
      throw new Error(`Username "${studentData.username}" is already taken. Please choose a different username.`);
    }
    
    // Get a valid UUID for the teacher ID
    const validTeacherId = getValidUUID(teacherId);
    
    // First, check if teacher exists in the database
    const { data: teacherExists, error: teacherCheckError } = await supabase
      .from('teachers')
      .select('id, username, email')
      .eq('id', validTeacherId)
      .maybeSingle();
      
    if (teacherCheckError) {
      console.error("Error checking teacher existence:", teacherCheckError);
    }
    
    // If teacher doesn't exist, create the teacher record
    if (!teacherExists) {
      console.log("Teacher doesn't exist in database, creating teacher record:", validTeacherId);
      
      // Get teacher info from localStorage or auth context
      const teacherUsername = localStorage.getItem('teacherUsername') || 'teacher';
      const teacherEmail = localStorage.getItem('teacherEmail') || '';
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      
      // Generate a unique username if there's a conflict
      let finalUsername = teacherUsername;
      let usernameCounter = 1;
      
      while (true) {
        try {
          const { data: newTeacher, error: createTeacherError } = await supabase
            .from('teachers')
            .insert({
              id: validTeacherId,
              username: finalUsername,
              display_name: teacherUsername,
              email: teacherEmail,
              password: '***', // Placeholder
              is_active: true,
              subscription_type: isAdmin ? 'premium' : 'trial'
            })
            .select()
            .single();
            
          if (createTeacherError) {
            // If it's a unique constraint violation on username, try with a different username
            if (createTeacherError.code === '23505' && createTeacherError.message.includes('teachers_username_key')) {
              finalUsername = `${teacherUsername}_${usernameCounter}`;
              usernameCounter++;
              console.log(`Username conflict, trying with: ${finalUsername}`);
              continue;
            }
            throw createTeacherError;
          }
          
          console.log("Created teacher record:", newTeacher.id);
          break;
        } catch (error: any) {
          if (error.code === '23505' && error.message.includes('teachers_username_key')) {
            finalUsername = `${teacherUsername}_${usernameCounter}`;
            usernameCounter++;
            console.log(`Username conflict, trying with: ${finalUsername}`);
            continue;
          }
          throw error;
        }
      }
    } else {
      console.log("Teacher already exists in database:", teacherExists.id);
    }
    
    // Hash the password
    const password_hash = await bcrypt.hash(studentData.password, 10);
    
    console.log("Creating student in database with teacherId:", validTeacherId, "and schoolId:", studentData.schoolId);
    
    // Create student with school_id - IMPORTANT: this is where we need to ensure class_id gets set
    const { data, error } = await supabase
      .from('students')
      .insert({
        username: studentData.username,
        password_hash: password_hash,
        display_name: studentData.displayName,
        teacher_id: validTeacherId,
        school_id: studentData.schoolId,
        // Note: class_id will be set when student is added to a class
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error("Database error when creating student:", error);
      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        throw new Error(`Username "${studentData.username}" is already taken. Please choose a different username.`);
      }
      throw new Error(`Failed to create student: ${error.message}`);
    }
    
    console.log("Student created successfully:", data.id);

    // Create student profile entry with school_id
    try {
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: data.id,
          username: studentData.username,
          display_name: studentData.displayName,
          teacher_id: validTeacherId,
          school_id: studentData.schoolId,
          // Note: class_id will be set when student is added to a class
          coins: 0,
          spent_coins: 0
        });

      if (profileError) {
        console.error("Error creating student profile:", profileError);
        // Don't fail the whole operation for profile creation
      } else {
        console.log("Student profile created successfully with school ID:", studentData.schoolId);
      }
    } catch (profileError) {
      console.error("Error creating student profile:", profileError);
    }
    
    toast({
      title: "Student Created",
      description: `Successfully created student account for ${studentData.displayName}. Add them to a class to assign class ID automatically.`
    });
    
    return {
      success: true,
      student: data
    };
  } catch (error: any) {
    console.error("Student creation error:", error);
    
    // Show toast with error message
    toast({
      title: "Error Creating Student",
      description: error.message || "An error occurred while creating the student",
      variant: "destructive"
    });
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
};

// Function to get school details
export const getSchoolName = async (schoolId: string): Promise<string> => {
  if (!schoolId) return "Unknown School";
  
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('name')
      .eq('id', schoolId)
      .single();
      
    if (error || !data) {
      throw error || new Error("School not found");
    }
    
    return data.name;
  } catch (error) {
    console.error("Error fetching school name:", error);
    
    // Fallback to localStorage
    try {
      const schoolsData = localStorage.getItem("schools");
      if (schoolsData) {
        const schools = JSON.parse(schoolsData);
        const school = schools.find((s: any) => s.id === schoolId);
        if (school) return school.name;
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
    
    return "Unknown School";
  }
};

export const getTeacherName = async (teacherId: string): Promise<string> => {
  if (!teacherId) return "Unknown Teacher";
  
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('display_name, username')
      .eq('id', teacherId)
      .single();
      
    if (error || !data) {
      throw error || new Error("Teacher not found");
    }
    
    return data.display_name || data.username;
  } catch (error) {
    console.error("Error fetching teacher name:", error);
    return "Unknown Teacher";
  }
};

export const createStudentUtils = () => {
  if (typeof getValidUUID !== 'function') {
    console.log("Creating studentUtils file");
    return true;
  }
  return false;
};
