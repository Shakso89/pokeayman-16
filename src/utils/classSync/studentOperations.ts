import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";

/**
 * Adds a student to a class
 */
export const addStudentToClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    // First get the current class data
    const { data: classData, error: fetchError } = await supabase
      .from('classes')
      .select('students')
      .eq('id', classId)
      .single();
    
    if (fetchError) {
      return handleDatabaseError(fetchError, false);
    }
    
    // Prepare updated students array
    const currentStudents = classData && Array.isArray(classData.students) ? classData.students : [];
    
    if (currentStudents.includes(studentId)) {
      return true; // Student already in class
    }
    
    const updatedStudents = [...currentStudents, studentId];
    
    // Update the class with the new students array
    const { error: updateError } = await supabase
      .from('classes')
      .update({ students: updatedStudents })
      .eq('id', classId);
    
    if (updateError) {
      return handleDatabaseError(updateError, false);
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
    
    return true;
  } catch (error) {
    console.error("Error in addStudentToClass:", error);
    
    // Fallback to localStorage
    try {
      const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const updatedClasses = existingClasses.map((cls: any) => {
        if (cls.id === classId) {
          const students = cls.students || [];
          if (!students.includes(studentId)) {
            return {
              ...cls,
              students: [...students, studentId]
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
            classId
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
      return handleDatabaseError(fetchError, false);
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
      return handleDatabaseError(updateError, false);
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
    
    return true;
  } catch (error) {
    console.error("Error in removeStudentFromClass:", error);
    
    // Fallback to localStorage
    try {
      const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const updatedClasses = existingClasses.map((cls: any) => {
        if (cls.id === classId) {
          const students = cls.students || [];
          return {
            ...cls,
            students: students.filter((id: string) => id !== studentId)
          };
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
            classId: null
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
  }
};

/**
 * Adds multiple students to a class
 */
export const addMultipleStudentsToClass = async (classId: string, studentIds: string[]): Promise<boolean> => {
  try {
    // First get the current class data
    const { data: classData, error: fetchError } = await supabase
      .from('classes')
      .select('students')
      .eq('id', classId)
      .single();
    
    if (fetchError) {
      return handleDatabaseError(fetchError, false);
    }
    
    // Prepare updated students array
    const currentStudents = classData && Array.isArray(classData.students) ? classData.students : [];
    
    // Filter out students already in the class
    const newStudents = studentIds.filter(id => !currentStudents.includes(id));
    
    if (newStudents.length === 0) {
      return true; // All students already in class
    }
    
    const updatedStudents = [...currentStudents, ...newStudents];
    
    // Update the class with the new students array
    const { error: updateError } = await supabase
      .from('classes')
      .update({ students: updatedStudents })
      .eq('id', classId);
    
    if (updateError) {
      return handleDatabaseError(updateError, false);
    }
    
    // Also update the students' class_id fields
    for (const studentId of newStudents) {
      const { error: studentError } = await supabase
        .from('students')
        .update({ class_id: classId })
        .eq('id', studentId);
      
      if (studentError) {
        console.error(`Error updating student's class_id for ${studentId}:`, studentError);
        // Continue anyway as the student is added to the class
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in addMultipleStudentsToClass:", error);
    
    // Fallback to localStorage
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
      const updatedStudents = allStudents.map((student: any) => {
        if (studentIds.includes(student.id)) {
          return {
            ...student,
            classId
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
  }
};
