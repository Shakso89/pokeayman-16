
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
  
  // Try using the edge function to create the student
  try {
    // Insert directly into Supabase using the client
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
    // Fallback to edge function if direct insertion fails
    const { data: createResponse, error: edgeFunctionError } = await supabase.functions.invoke("create_student", {
      body: {
        username: studentData.username,
        password: studentData.password, 
        displayName: studentData.displayName,
        teacherId: validTeacherId
      }
    });
    
    if (edgeFunctionError) {
      throw new Error(`Edge function error: ${edgeFunctionError.message}`);
    }
    
    if (createResponse?.error) {
      throw new Error(createResponse.error);
    }

    return createResponse;
  }
};
