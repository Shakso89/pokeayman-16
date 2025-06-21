
import { supabase } from "@/integrations/supabase/client";

export const refreshTopStudents = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.rpc('update_top_students');
    
    if (error) {
      console.error("Error refreshing top students:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error refreshing top students:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

export const getClassWithBadgeData = async (classId: string) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        schools!inner(
          id,
          name,
          top_student_id
        )
      `)
      .eq('id', classId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching class badge data:", error);
    return { data: null, error };
  }
};

export const assignStarOfClass = async (
  classId: string, 
  studentId: string | null
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('classes')
      .update({ star_student_id: studentId })
      .eq('id', classId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error assigning star of class:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};
