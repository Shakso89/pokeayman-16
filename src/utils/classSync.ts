
import { supabase } from "@/integrations/supabase/client";
import { ClassData } from "@/utils/pokemon/classManagement";
import { toast } from "@/hooks/use-toast";

/**
 * Creates a real-time subscription to class changes
 * @param callback Function to call when class data changes
 * @param teacherId Optional teacher ID to filter changes by
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToClassChanges = (
  callback: () => void,
  teacherId?: string
) => {
  // Set up channel for real-time updates
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'classes'
      },
      (payload) => {
        console.log('Class change detected:', payload);
        // Call the callback to refresh data
        callback();
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Fetches classes from the database for a specific teacher
 */
export const fetchTeacherClasses = async (teacherId: string): Promise<ClassData[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId);
    
    if (error) {
      console.error("Error fetching classes from database:", error);
      throw error;
    }
    
    // Map database response to ClassData interface
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      teacherId: item.teacher_id,
      schoolId: item.school_id || teacherId, // Fallback to teacherId if no school_id
      students: item.students || [],
      isPublic: item.is_public !== false,
      createdAt: item.created_at,
      description: item.description || '',
      likes: item.likes || []
    }));
  } catch (error) {
    console.error("Error in fetchTeacherClasses:", error);
    // Fallback to localStorage for offline capability
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    return allClasses.filter((cls: any) => cls.teacherId === teacherId);
  }
};

/**
 * Fetches classes from the database for a specific school
 */
export const fetchSchoolClasses = async (schoolId: string): Promise<ClassData[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId);
    
    if (error) {
      console.error("Error fetching school classes from database:", error);
      throw error;
    }
    
    // Map database response to ClassData interface
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      teacherId: item.teacher_id,
      schoolId: item.school_id || schoolId,
      students: item.students || [],
      isPublic: item.is_public !== false,
      createdAt: item.created_at,
      description: item.description || '',
      likes: item.likes || []
    }));
  } catch (error) {
    console.error("Error in fetchSchoolClasses:", error);
    // Fallback to localStorage
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    return allClasses.filter((cls: any) => cls.schoolId === schoolId);
  }
};

/**
 * Creates a new class in the database
 */
export const createClass = async (classData: Omit<ClassData, "id">): Promise<ClassData> => {
  try {
    // Make sure we have the minimal required data
    if (!classData.name || !classData.teacherId) {
      throw new Error("Class name and teacher ID are required");
    }

    // Insert class into Supabase
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name: classData.name,
        teacher_id: classData.teacherId,
        school_id: classData.schoolId,
        description: classData.description || null,
        is_public: classData.isPublic !== false,
        students: classData.students || [],
        likes: classData.likes || [],
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating class in database:", error);
      throw error;
    }
    
    // Map response to our ClassData interface
    const newClass: ClassData = {
      id: data.id,
      name: data.name,
      teacherId: data.teacher_id,
      schoolId: data.school_id || classData.schoolId,
      students: data.students || [],
      isPublic: data.is_public !== false,
      createdAt: data.created_at,
      description: data.description || '',
      likes: data.likes || []
    };
    
    return newClass;
  } catch (error) {
    console.error("Error in createClass:", error);
    
    // Fallback to localStorage if database operation fails
    const classId = `class-${Date.now()}`;
    const newClass = {
      id: classId,
      ...classData,
      createdAt: new Date().toISOString()
    };
    
    // Update localStorage
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    localStorage.setItem("classes", JSON.stringify([...existingClasses, newClass]));
    
    return newClass as ClassData;
  }
};

/**
 * Updates an existing class in the database
 */
export const updateClass = async (classData: ClassData): Promise<ClassData> => {
  try {
    // Update class in Supabase
    const { error } = await supabase
      .from('classes')
      .update({
        name: classData.name,
        teacher_id: classData.teacherId,
        school_id: classData.schoolId,
        description: classData.description || null,
        is_public: classData.isPublic !== false,
        students: classData.students || [],
        likes: classData.likes || []
      })
      .eq('id', classData.id);
    
    if (error) {
      console.error("Error updating class in database:", error);
      throw error;
    }
    
    return classData;
  } catch (error) {
    console.error("Error in updateClass:", error);
    
    // Fallback to localStorage
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const updatedClasses = existingClasses.map((cls: any) => {
      if (cls.id === classData.id) {
        return classData;
      }
      return cls;
    });
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    return classData;
  }
};

/**
 * Deletes a class from the database
 */
export const deleteClass = async (classId: string): Promise<boolean> => {
  try {
    // Delete class from Supabase
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
    
    if (error) {
      console.error("Error deleting class from database:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteClass:", error);
    
    // Fallback to localStorage
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const updatedClasses = existingClasses.filter((cls: any) => cls.id !== classId);
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    return true;
  }
};

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
      console.error("Error fetching class data:", fetchError);
      throw fetchError;
    }
    
    // Prepare updated students array
    const currentStudents = classData?.students || [];
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
      console.error("Error updating class with new student:", updateError);
      throw updateError;
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
      console.error("Error fetching class data:", fetchError);
      throw fetchError;
    }
    
    // Prepare updated students array
    const currentStudents = classData?.students || [];
    const updatedStudents = currentStudents.filter(id => id !== studentId);
    
    // Update the class with the new students array
    const { error: updateError } = await supabase
      .from('classes')
      .update({ students: updatedStudents })
      .eq('id', classId);
    
    if (updateError) {
      console.error("Error removing student from class:", updateError);
      throw updateError;
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
 * Toggles like status for a class
 */
export const toggleClassLike = async (classId: string, teacherId: string): Promise<ClassData | null> => {
  try {
    // First get the current class data
    const { data: classData, error: fetchError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching class data:", fetchError);
      throw fetchError;
    }
    
    // Prepare updated likes array
    const currentLikes = classData?.likes || [];
    const hasLiked = currentLikes.includes(teacherId);
    
    const updatedLikes = hasLiked
      ? currentLikes.filter(id => id !== teacherId)
      : [...currentLikes, teacherId];
    
    // Update the class with the new likes array
    const { data: updatedClass, error: updateError } = await supabase
      .from('classes')
      .update({ likes: updatedLikes })
      .eq('id', classId)
      .select()
      .single();
    
    if (updateError) {
      console.error("Error updating class likes:", updateError);
      throw updateError;
    }
    
    // Map to our ClassData interface
    return {
      id: updatedClass.id,
      name: updatedClass.name,
      teacherId: updatedClass.teacher_id,
      schoolId: updatedClass.school_id,
      students: updatedClass.students || [],
      isPublic: updatedClass.is_public !== false,
      createdAt: updatedClass.created_at,
      description: updatedClass.description || '',
      likes: updatedClass.likes || []
    };
  } catch (error) {
    console.error("Error in toggleClassLike:", error);
    
    // Fallback to localStorage
    try {
      const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      let updatedClass = null;
      
      const updatedClasses = existingClasses.map((cls: any) => {
        if (cls.id === classId) {
          const likes = cls.likes || [];
          const hasLiked = likes.includes(teacherId);
          
          const updatedLikes = hasLiked
            ? likes.filter((id: string) => id !== teacherId)
            : [...likes, teacherId];
          
          updatedClass = {
            ...cls,
            likes: updatedLikes
          };
          
          return updatedClass;
        }
        return cls;
      });
      
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
      
      return updatedClass as ClassData;
    } catch (localStorageError) {
      console.error("Error updating localStorage:", localStorageError);
      return null;
    }
  }
};
