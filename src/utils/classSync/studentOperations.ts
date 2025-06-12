
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";

/**
 * Adds a student to a class (students can be in multiple classes within the same school)
 */
export const addStudentToClass = async (classId: string, studentId: string): Promise<boolean> => {
  try {
    console.log(`Adding student ${studentId} to class ${classId}`);
    
    // First get the current class data to check school
    const { data: classData, error: fetchError } = await supabase
      .from('classes')
      .select('students, school_id')
      .eq('id', classId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching class data:", fetchError);
      return updateLocalStorage(classId, studentId, true);
    }
    
    // Check if student exists and get their current school
    const { data: studentData, error: studentFetchError } = await supabase
      .from('students')
      .select('class_id, teacher_id')
      .eq('id', studentId)
      .single();
    
    if (studentFetchError) {
      console.error("Error fetching student data:", studentFetchError);
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
      return updateLocalStorage(classId, studentId, true);
    }
    
    // Update the student's class_id field (can store multiple class IDs separated by commas)
    if (studentData) {
      const existingClassIds = studentData.class_id ? studentData.class_id.split(',').filter((id: string) => id.trim()) : [];
      if (!existingClassIds.includes(classId)) {
        existingClassIds.push(classId);
        const newClassIds = existingClassIds.join(',');
        
        const { error: studentError } = await supabase
          .from('students')
          .update({ class_id: newClassIds })
          .eq('id', studentId);
        
        if (studentError) {
          console.error("Error updating student's class_id:", studentError);
        }
      }
    }
    
    // Update localStorage as a fallback
    updateLocalStorage(classId, studentId, true);
    
    return true;
  } catch (error) {
    console.error("Error in addStudentToClass:", error);
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
      return updateLocalStorage(classId, studentId, false);
    }
    
    // Prepare updated students array
    const currentStudents = classData && Array.isArray(classData.students) ? classData.students : [];
    const updatedStudents = currentStudents.filter((id: string) => id !== studentId);
    
    // Update the class with the new students array
    const { error: updateError } = await supabase
      .from('classes')
      .update({ students: updatedStudents })
      .eq('id', classId);
    
    if (updateError) {
      return updateLocalStorage(classId, studentId, false);
    }
    
    // Update the student's class_id field to remove this class
    const { data: studentData } = await supabase
      .from('students')
      .select('class_id')
      .eq('id', studentId)
      .single();
    
    if (studentData && studentData.class_id) {
      const existingClassIds = studentData.class_id.split(',').filter((id: string) => id.trim() && id !== classId);
      const newClassIds = existingClassIds.length > 0 ? existingClassIds.join(',') : null;
      
      const { error: studentError } = await supabase
        .from('students')
        .update({ class_id: newClassIds })
        .eq('id', studentId);
      
      if (studentError) {
        console.error("Error updating student's class_id:", studentError);
      }
    }
    
    // Update localStorage as a fallback
    updateLocalStorage(classId, studentId, false);
    
    return true;
  } catch (error) {
    console.error("Error in removeStudentFromClass:", error);
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
    
    // Try to get class from Supabase first
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
        const newStudents = studentIds.filter((id: string) => !currentStudents.includes(id));
        
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
          
          // Also update the students' class_id fields
          for (const studentId of newStudents) {
            try {
              const { data: studentData } = await supabase
                .from('students')
                .select('class_id')
                .eq('id', studentId)
                .single();
              
              if (studentData) {
                const existingClassIds = studentData.class_id ? studentData.class_id.split(',').filter((id: string) => id.trim()) : [];
                if (!existingClassIds.includes(classId)) {
                  existingClassIds.push(classId);
                  const newClassIds = existingClassIds.join(',');
                  
                  await supabase
                    .from('students')
                    .update({ class_id: newClassIds })
                    .eq('id', studentId);
                }
              }
            } catch (studentError) {
              console.error(`Error updating student's class_id for ${studentId}:`, studentError);
            }
          }
        } else {
          console.error("Error updating class students array:", updateError);
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
    
    // Also update student record in localStorage for multiple class support
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    const updatedStudents = allStudents.map((student: any) => {
      if (student.id === studentId) {
        if (isAdding) {
          // Add to multiple classes
          const existingClassIds = student.class_id ? student.class_id.split(',').filter((id: string) => id.trim()) : [];
          if (!existingClassIds.includes(classId)) {
            existingClassIds.push(classId);
          }
          return {
            ...student,
            classId: existingClassIds.join(','),
            class_id: existingClassIds.join(',')
          };
        } else {
          // Remove from specific class
          const existingClassIds = student.class_id ? student.class_id.split(',').filter((id: string) => id.trim() && id !== classId) : [];
          return {
            ...student,
            classId: existingClassIds.length > 0 ? existingClassIds.join(',') : null,
            class_id: existingClassIds.length > 0 ? existingClassIds.join(',') : null
          };
        }
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
    
    // Update student records for multiple class support
    const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
    
    const updatedStudents = allStudents.map((student: any) => {
      if (studentIds.includes(student.id)) {
        const existingClassIds = student.class_id ? student.class_id.split(',').filter((id: string) => id.trim()) : [];
        if (!existingClassIds.includes(classId)) {
          existingClassIds.push(classId);
        }
        return {
          ...student,
          classId: existingClassIds.join(','),
          class_id: existingClassIds.join(',')
        };
      }
      return student;
    });
    
    // Add any students that don't exist yet
    const existingIds = new Set(allStudents.map((s: any) => s.id));
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
