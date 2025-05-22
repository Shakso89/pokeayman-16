
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";

/**
 * Adds a student to a class
 */
export const addStudentToClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    console.log(`Adding student ${studentId} to class ${classId}`);
    
    // First get the current class data
    const { data: classData, error: fetchError } = await supabase
      .from('classes')
      .select('students')
      .eq('id', classId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching class data:", fetchError);
      // Try local storage if Supabase fails
      return updateLocalStorage(classId, studentId, true);
    }
    
    // Prepare updated students array
    const currentStudents = classData && Array.isArray(classData.students) ? classData.students : [];
    
    if (currentStudents.includes(studentId)) {
      console.log("Student already in class");
      return true; // Student already in class
    }
    
    const updatedStudents = [...currentStudents, studentId];
    console.log("Updated students array:", updatedStudents);
    
    // Update the class with the new students array
    const { error: updateError } = await supabase
      .from('classes')
      .update({ students: updatedStudents })
      .eq('id', classId);
    
    if (updateError) {
      console.error("Error updating class students array:", updateError);
      // Try local storage if Supabase fails
      return updateLocalStorage(classId, studentId, true);
    }
    
    // Also update the student's class_id field
    const { error: studentError } = await supabase
      .from('students')
      .update({ class_id: classId })
      .eq('id', studentId);
    
    if (studentError) {
      console.error("Error updating student's class_id:", studentError);
      // Continue anyway as the student is added to the class
    }
    
    // Update localStorage as a fallback
    updateLocalStorage(classId, studentId, true);
    
    return true;
  } catch (error) {
    console.error("Error in addStudentToClass:", error);
    
    // Fallback to localStorage
    return updateLocalStorage(classId, studentId, true);
  }
};

/**
 * Removes a student from a class
 */
export const removeStudentFromClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    // First get the current class data
    const { data: classData, error: fetchError } = await supabase
      .from('classes')
      .select('students')
      .eq('id', classId)
      .single();
    
    if (fetchError) {
      // Try local storage if Supabase fails
      return updateLocalStorage(classId, studentId, false);
    }
    
    // Prepare updated students array
    const currentStudents = classData && Array.isArray(classData.students) ? classData.students : [];
    const updatedStudents = currentStudents.filter(id => id !== studentId);
    
    // Update the class with the new students array
    const { error: updateError } = await supabase
      .from('classes')
      .update({ students: updatedStudents })
      .eq('id', classId);
    
    if (updateError) {
      // Try local storage if Supabase fails
      return updateLocalStorage(classId, studentId, false);
    }
    
    // Also update the student's class_id field to null
    const { error: studentError } = await supabase
      .from('students')
      .update({ class_id: null })
      .eq('id', studentId);
    
    if (studentError) {
      console.error("Error updating student's class_id:", studentError);
      // Continue anyway as the student is removed from the class
    }
    
    // Update localStorage as a fallback
    updateLocalStorage(classId, studentId, false);
    
    return true;
  } catch (error) {
    console.error("Error in removeStudentFromClass:", error);
    
    // Fallback to localStorage
    return updateLocalStorage(classId, studentId, false);
  }
};

/**
 * Adds multiple students to a class
 */
export const addMultipleStudentsToClass = async (classId: string, studentIds: string[]): Promise<boolean> => {
  try {
    console.log(`Adding ${studentIds.length} students to class ${classId}`);
    
    if (studentIds.length === 0) {
      return true; // Nothing to do
    }
    
    // Try to get class data from localStorage first (fallback mechanism)
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const classFromLocal = allClasses.find((cls: any) => cls.id === classId);
    
    // Try to get class from Supabase
    let currentStudents: string[] = [];
    let supabaseSuccess = false;
    
    try {
      // First get the current class data
      const { data: classData, error: fetchError } = await supabase
        .from('classes')
        .select('students')
        .eq('id', classId)
        .single();
      
      if (!fetchError) {
        currentStudents = classData && Array.isArray(classData.students) ? classData.students : [];
        
        // Filter out students already in the class
        const newStudents = studentIds.filter(id => !currentStudents.includes(id));
        
        if (newStudents.length === 0) {
          console.log("All students already in class");
          return true; // All students already in class
        }
        
        const updatedStudents = [...currentStudents, ...newStudents];
        console.log("Updated students array:", updatedStudents);
        
        // Update the class with the new students array
        const { error: updateError } = await supabase
          .from('classes')
          .update({ students: updatedStudents })
          .eq('id', classId);
        
        if (!updateError) {
          supabaseSuccess = true;
        } else {
          console.error("Error updating class students array:", updateError);
        }
        
        // Also update the students' class_id fields
        for (const studentId of newStudents) {
          const { error: studentError } = await supabase
            .from('students')
            .update({ class_id: classId })
            .eq('id', studentId);
          
          if (studentError) {
            console.error(`Error updating student's class_id for ${studentId}:`, studentError);
          }
        }
      }
    } catch (error) {
      console.error("Supabase operations failed:", error);
    }
    
    // Always update localStorage as backup
    const result = updateMultipleLocalStorage(classId, studentIds);
    
    return supabaseSuccess || result; // Return true if either operation succeeded
  } catch (error) {
    console.error("Error in addMultipleStudentsToClass:", error);
    
    // Fallback to localStorage
    return updateMultipleLocalStorage(classId, studentIds);
  }
};

// Helper function to update localStorage
const updateLocalStorage = (classId: string, studentId: string, isAdding: boolean): boolean => {
  try {
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const updatedClasses = existingClasses.map((cls: any) => {
      if (cls.id === classId) {
        const students = cls.students || [];
        if (isAdding) {
          if (!students.includes(studentId)) {
            return {
              ...cls,
              students: [...students, studentId]
            };
          }
        } else {
          return {
            ...cls,
            students: students.filter((id: string) => id !== studentId)
          };
        }
      }
      return cls;
    });
    
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    // Also update student record in localStorage
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    const updatedStudents = allStudents.map((student: any) => {
      if (student.id === studentId) {
        return {
          ...student,
          classId: isAdding ? classId : null,
          class_id: isAdding ? classId : null // Add both formats for compatibility
        };
      }
      return student;
    });
    
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    
    return true;
  } catch (localStorageError) {
    console.error("Error updating localStorage:", localStorageError);
    return false;
  }
};

// Helper function to update multiple students in localStorage
const updateMultipleLocalStorage = (classId: string, studentIds: string[]): boolean => {
  try {
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const updatedClasses = existingClasses.map((cls: any) => {
      if (cls.id === classId) {
        const students = cls.students || [];
        const newStudentsList = [...students];
        
        studentIds.forEach((id: string) => {
          if (!newStudentsList.includes(id)) {
            newStudentsList.push(id);
          }
        });
        
        return {
          ...cls,
          students: newStudentsList
        };
      }
      return cls;
    });
    
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    // Also update student records in localStorage
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    
    // Check which students exist
    const existingIds = new Set(allStudents.map((s: any) => s.id));
    
    // Update existing students
    const updatedStudents = allStudents.map((student: any) => {
      if (studentIds.includes(student.id)) {
        return {
          ...student,
          classId: classId,
          class_id: classId // Add both formats for compatibility
        };
      }
      return student;
    });
    
    // Add any students that don't exist yet
    studentIds.forEach(id => {
      if (!existingIds.has(id)) {
        // Create a minimal student record
        updatedStudents.push({
          id,
          username: `student-${id.substring(0, 5)}`,
          display_name: `Student ${id.substring(0, 5)}`,
          classId: classId,
          class_id: classId
        });
      }
    });
    
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    
    return true;
  } catch (localStorageError) {
    console.error("Error updating localStorage:", localStorageError);
    return false;
  }
};
