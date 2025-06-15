import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";

/**
 * Adds a student to a class by creating an entry in the student_classes join table.
 */
export const addStudentToClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    console.log(`Adding student ${studentId} to class ${classId}`);
    
    const { error } = await supabase
      .from('student_classes')
      .insert({ student_id: studentId, class_id: classId });
      
    if (error) {
      if (error.code === '23505') {
        console.log('Student already in class.');
        return true;
      }
      handleDatabaseError(error, "Error adding student to class");
      return false;
    }
    
    console.log(`Student ${studentId} added to class ${classId} successfully.`);
    return true;
  } catch (error) {
    console.error("Error in addStudentToClass:", error);
    return false;
  }
};

/**
 * Removes a student from a class by deleting the entry from the student_classes join table.
 */
export const removeStudentFromClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    console.log(`Removing student ${studentId} from class ${classId}`);

    const { error } = await supabase
      .from('student_classes')
      .delete()
      .eq('student_id', studentId)
      .eq('class_id', classId);

    if (error) {
      handleDatabaseError(error, "Error removing student from class");
      return false;
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
    
    const recordsToInsert = studentIds.map(studentId => ({
      class_id: classId,
      student_id: studentId,
    }));
    
    const { error } = await supabase
      .from('student_classes')
      .upsert(recordsToInsert, { onConflict: 'student_id,class_id', ignoreDuplicates: true });

    if (error) {
      handleDatabaseError(error, "Error adding multiple students to class");
      return false;
    }
    
    console.log(`Successfully processed adding ${studentIds.length} students to class ${classId}.`);
    return true;
  } catch (error) {
    console.error("Error in addMultipleStudentsToClass:", error);
    return false;
  }
};
