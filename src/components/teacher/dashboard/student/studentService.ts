
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getValidUUID } from "./studentUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { Student } from "@/types/database";

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

  // Get a valid UUID for the teacher ID
  const validTeacherId = getValidUUID(teacherId);
  
  try {
    // First approach: use the edge function to create the student
    console.log("Calling create_student edge function with:", {
      username: studentData.username,
      displayName: studentData.displayName,
      teacherId: validTeacherId,
      schoolId: studentData.schoolId
    });
    
    const { data: createResponse, error: edgeFunctionError } = await supabase.functions.invoke("create_student", {
      body: {
        username: studentData.username,
        password: studentData.password, 
        displayName: studentData.displayName,
        teacherId: validTeacherId,
        schoolId: studentData.schoolId || undefined
      }
    });
    
    console.log("Edge function response:", createResponse);
    
    if (edgeFunctionError) {
      console.error("Edge function error:", edgeFunctionError);
      throw new Error(`Edge function error: ${edgeFunctionError.message}`);
    }
    
    if (createResponse?.error) {
      console.error("Create student error:", createResponse.error);
      throw new Error(createResponse.error);
    }

    // If edge function successful, return the response
    if (createResponse?.student) {
      toast({
        title: "Student Created",
        description: `Successfully created student account for ${studentData.displayName}`
      });
      return createResponse;
    }

    // Fallback approach if edge function didn't return a student
    console.log("Falling back to direct database insert");
    const { data, error } = await supabase
      .from('students')
      .insert({
        username: studentData.username,
        password: studentData.password,
        display_name: studentData.displayName,
        teacher_id: validTeacherId,
        school_id: studentData.schoolId || undefined,
        is_active: true,
        created_at: new Date().toISOString()
      } as Student)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create student: ${error.message}`);
    }
    
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
