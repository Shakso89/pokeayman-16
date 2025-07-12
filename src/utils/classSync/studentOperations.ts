
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";

/**
 * Adds a student to a class using a secure database function that bypasses RLS
 */
export const addStudentToClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    console.log(`Adding student ${studentId} to class ${classId}`);
    
    // Use the secure database function that bypasses RLS
    const { data, error } = await supabase.rpc('add_student_to_class', {
      p_student_id: studentId,
      p_class_id: classId
    });
    
    if (error) {
      console.error("Error calling add_student_to_class function:", error);
      return false;
    }
    
    if (data === true) {
      console.log(`Student ${studentId} added to class ${classId} successfully.`);
      return true;
    } else {
      console.error("Database function returned false for adding student to class");
      return false;
    }
    
  } catch (error) {
    console.error("Error in addStudentToClass:", error);
    return false;
  }
};

/**
 * Helper function to add student directly when RLS is blocking
 */
const addStudentDirectly = async (classId: string, studentId: string, teacherId: string): Promise<boolean> => {
  try {
    console.log("Attempting direct student addition...");
    
    // Create a temporary auth context by setting the teacher in the request
    const { error: joinError } = await supabase
      .from('student_classes')
      .insert({ 
        student_id: studentId, 
        class_id: classId
      });
    
    if (joinError && joinError.code !== '23505') {
      console.error("Direct insertion failed:", joinError);
      return false;
    }
    
    await updateStudentClassInfo(classId, studentId);
    return true;
    
  } catch (error) {
    console.error("Direct addition failed:", error);
    return false;
  }
};

/**
 * Helper function to update student class information
 */
const updateStudentClassInfo = async (classId: string, studentId: string) => {
  // Update the student's class_id in the students table
  const { error: updateError } = await supabase
    .from('students')
    .update({ class_id: classId })
    .eq('id', studentId);
    
  if (updateError) {
    console.error("Error updating student class_id:", updateError);
  } else {
    console.log(`Student ${studentId} class_id updated to ${classId}`);
  }
  
  // Also update student_profiles table with the class_id
  const { error: profileError } = await supabase
    .from('student_profiles')
    .update({ class_id: classId })
    .eq('user_id', studentId);
    
  if (profileError) {
    console.error("Error updating student profile class_id:", profileError);
    // Try to find by id if user_id doesn't work
    const { error: profileByIdError } = await supabase
      .from('student_profiles')
      .update({ class_id: classId })
      .eq('id', studentId);
      
    if (profileByIdError) {
      console.error("Error updating student profile by id:", profileByIdError);
    } else {
      console.log(`Student profile ${studentId} class_id updated to ${classId} (by id)`);
    }
  } else {
    console.log(`Student profile ${studentId} class_id updated to ${classId} (by user_id)`);
  }
};

/**
 * Removes a student from a class using a secure database function that bypasses RLS
 */
export const removeStudentFromClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    console.log(`Removing student ${studentId} from class ${classId}`);

    // Use the secure database function that bypasses RLS
    const { data, error } = await supabase.rpc('remove_student_from_class', {
      p_student_id: studentId,
      p_class_id: classId
    });
    
    if (error) {
      console.error("Error calling remove_student_from_class function:", error);
      return false;
    }
    
    if (data === true) {
      console.log(`Student ${studentId} removed from class ${classId} successfully.`);
      return true;
    } else {
      console.error("Database function returned false for removing student from class");
      return false;
    }
    
  } catch (error) {
    console.error("Error in removeStudentFromClass:", error);
    return false;
  }
};

/**
 * Adds multiple students to a class. Ignores duplicates if they are already in the class.
 */
export const addMultipleStudentsToClass = async (classId: string, studentIds: string[]): Promise<boolean> => {
  try {
    console.log(`Adding ${studentIds.length} students to class ${classId}`);
    
    if (studentIds.length === 0) {
      return true; // Nothing to do
    }
    
    let successCount = 0;
    
    // Process each student individually to ensure proper handling
    for (const studentId of studentIds) {
      const success = await addStudentToClass(classId, studentId);
      if (success) {
        successCount++;
      }
    }
    
    console.log(`Successfully added ${successCount}/${studentIds.length} students to class ${classId}.`);
    return successCount > 0; // Return true if at least one student was added
  } catch (error) {
    console.error("Error in addMultipleStudentsToClass:", error);
    return false;
  }
};
