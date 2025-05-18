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
  schoolId?: string;
}

export const createStudent = async (
  studentData: StudentData,
  teacherId: string | null,
  t: ReturnType<typeof useTranslation>["t"]
) => {
  // Validate student data
  if (!studentData.username || !studentData.password || !studentData.displayName) {
    const errorMessage = t("fill-all-fields") || "Please fill all required fields";
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
    // Hash the password
    const password_hash = await bcrypt.hash(studentData.password, 10);
    
    // Get a valid UUID for the teacher ID
    const validTeacherId = getValidUUID(teacherId);
    
    // Direct database approach first (more reliable than edge function in this case)
    console.log("Creating student with username:", studentData.username);
    
    const { data, error } = await supabase
      .from('students')
      .insert({
        username: studentData.username,
        password_hash: password_hash,
        display_name: studentData.displayName,
        teacher_id: validTeacherId,
        school_id: studentData.schoolId || null,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        throw new Error(`Username "${studentData.username}" is already taken. Please choose a different username.`);
      }
      throw new Error(`Failed to create student: ${error.message}`);
    }
    
    toast({
      title: "Student Created",
      description: `Successfully created student account for ${studentData.displayName}`
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

// Function to get teacher details
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
