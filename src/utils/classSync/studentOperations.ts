
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";

/**
 * Adds a student to a class by creating an entry in the student_classes join table
 * and updating the student's class_id in the students table.
 */
export const addStudentToClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    console.log(`Adding student ${studentId} to class ${classId}`);
    
    // First, add to student_classes join table
    const { error: joinError } = await supabase
      .from('student_classes')
      .insert({ student_id: studentId, class_id: classId });
      
    if (joinError) {
      if (joinError.code === '23505') {
        console.log('Student already in class join table.');
      } else {
        handleDatabaseError(joinError, "Error adding student to class join table");
        return false;
      }
    }
    
    // Then, update the student's class_id in the students table
    const { error: updateError } = await supabase
      .from('students')
      .update({ class_id: classId })
      .eq('id', studentId);
      
    if (updateError) {
      console.error("Error updating student class_id:", updateError);
      // Don't fail completely if the update fails
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
    
    console.log(`Student ${studentId} added to class ${classId} successfully.`);
    return true;
  } catch (error) {
    console.error("Error in addStudentToClass:", error);
    return false;
  }
};

/**
 * Removes a student from a class by deleting the entry from the student_classes join table
 * and clearing the student's class_id in the students table.
 */
export const removeStudentFromClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    console.log(`Removing student ${studentId} from class ${classId}`);

    // Remove from student_classes join table
    const { error: joinError } = await supabase
      .from('student_classes')
      .delete()
      .eq('student_id', studentId)
      .eq('class_id', classId);

    if (joinError) {
      handleDatabaseError(joinError, "Error removing student from class join table");
      return false;
    }

    // Clear the student's class_id in the students table
    const { error: updateError } = await supabase
      .from('students')
      .update({ class_id: null })
      .eq('id', studentId);
      
    if (updateError) {
      console.error("Error clearing student class_id:", updateError);
      // Don't fail completely if the update fails
    } else {
      console.log(`Student ${studentId} class_id cleared`);
    }
    
    // Also update student_profiles table
    const { error: profileError } = await supabase
      .from('student_profiles')
      .update({ class_id: null })
      .eq('user_id', studentId);
      
    if (profileError) {
      // Try by id if user_id doesn't work
      const { error: profileByIdError } = await supabase
        .from('student_profiles')
        .update({ class_id: null })
        .eq('id', studentId);
        
      if (profileByIdError) {
        console.error("Error clearing student profile class_id:", profileByIdError);
      } else {
        console.log(`Student profile ${studentId} class_id cleared (by id)`);
      }
    } else {
      console.log(`Student profile ${studentId} class_id cleared (by user_id)`);
    }

    console.log(`Student ${studentId} removed from class ${classId} successfully.`);
    return true;
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
