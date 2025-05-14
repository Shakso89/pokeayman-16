
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getValidUUID } from "./studentUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { Student } from "@/types/database";

interface StudentData {
  username: string;
  password: string;
  displayName: string;
}

export const createStudent = async (
  studentData: StudentData,
  teacherId: string | null,
  t: ReturnType<typeof useTranslation>["t"]
) => {
  // Validate student data
  if (!studentData.username || !studentData.password || !studentData.displayName) {
    toast({
      title: "Error",
      description: t("fill-all-fields"),
      variant: "destructive"
    });
    throw new Error(t("fill-all-fields"));
  }
  
  if (!teacherId) {
    toast({
      title: "Error",
      description: "Teacher ID is missing",
      variant: "destructive"
    });
    throw new Error("Teacher ID is missing");
  }

  // Get a valid UUID for the teacher ID
  const validTeacherId = getValidUUID(teacherId);
  
  try {
    // First approach: use the edge function to create the student
    const { data: createResponse, error: edgeFunctionError } = await supabase.functions.invoke("create_student", {
      body: {
        username: studentData.username,
        password: studentData.password, 
        displayName: studentData.displayName,
        teacherId: validTeacherId
      }
    });
    
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
