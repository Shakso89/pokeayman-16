
import { supabase } from "@/integrations/supabase/client";
import { ClassData } from "@/utils/pokemon/classManagement";
import { toast } from "@/hooks/use-toast";
import { Class } from "@/integrations/supabase/custom-types";

// Helper function to safely handle database errors and responses
const handleDatabaseError = <T>(error: any, fallback: T): T => {
  console.error("Database error:", error);
  return fallback;
};

// Helper function to convert database class to ClassData format
const mapDbClassToClassData = (dbClass: any): ClassData => {
  return {
    id: dbClass.id,
    name: dbClass.name,
    teacherId: dbClass.teacher_id || null,
    schoolId: dbClass.school_id || '',
    students: dbClass.students || [],
    isPublic: dbClass.is_public !== false,
    description: dbClass.description || '',
    likes: dbClass.likes || [],
    createdAt: dbClass.created_at
  };
};

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
      return handleDatabaseError(error, JSON.parse(localStorage.getItem("classes") || "[]")
        .filter((cls: any) => cls.teacherId === teacherId)
        .map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          teacherId: cls.teacherId || teacherId,
          schoolId: cls.schoolId || '',
          students: cls.students || [],
          isPublic: cls.isPublic !== false,
          createdAt: cls.createdAt || '',
          description: cls.description || '',
          likes: cls.likes || []
        }))
      );
    }
    
    if (!Array.isArray(data)) {
      console.error("Unexpected response from database:", data);
      return [];
    }
    
    // Map database response to ClassData interface with proper type safety
    return data.map(mapDbClassToClassData);
  } catch (error) {
    console.error("Error in fetchTeacherClasses:", error);
    // Fallback to localStorage for offline capability
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    
    return allClasses
      .filter((cls: any) => cls.teacherId === teacherId)
      .map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        teacherId: cls.teacherId || teacherId,
        schoolId: cls.schoolId || '',
        students: cls.students || [],
        isPublic: cls.isPublic !== false,
        createdAt: cls.createdAt || '',
        description: cls.description || '',
        likes: cls.likes || []
      }));
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
      return handleDatabaseError(error, JSON.parse(localStorage.getItem("classes") || "[]")
        .filter((cls: any) => cls.schoolId === schoolId)
        .map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          teacherId: cls.teacherId || '',
          schoolId: cls.schoolId || schoolId,
          students: cls.students || [],
          isPublic: cls.isPublic !== false,
          createdAt: cls.createdAt || '',
          description: cls.description || '',
          likes: cls.likes || []
        }))
      );
    }
    
    if (!Array.isArray(data)) {
      console.error("Unexpected response from database:", data);
      return [];
    }
    
    // Map database response to ClassData interface with proper type safety
    return data.map(mapDbClassToClassData);
  } catch (error) {
    console.error("Error in fetchSchoolClasses:", error);
    // Fallback to localStorage
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    
    return allClasses
      .filter((cls: any) => cls.schoolId === schoolId)
      .map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        teacherId: cls.teacherId || '',
        schoolId: cls.schoolId || schoolId,
        students: cls.students || [],
        isPublic: cls.isPublic !== false,
        createdAt: cls.createdAt || '',
        description: cls.description || '',
        likes: cls.likes || []
      }));
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
        likes: classData.likes || []
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating class in database:", error);
      
      // Fallback to localStorage if database operation fails
      const classId = `class-${Date.now()}`;
      const newClass: ClassData = {
        id: classId,
        name: classData.name,
        teacherId: classData.teacherId,
        schoolId: classData.schoolId,
        students: classData.students || [],
        isPublic: classData.isPublic !== false,
        description: classData.description || '',
        likes: classData.likes || [],
        createdAt: new Date().toISOString()
      };
      
      // Update localStorage
      const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      localStorage.setItem("classes", JSON.stringify([...existingClasses, newClass]));
      
      return newClass;
    }
    
    // Map response to our ClassData interface
    return mapDbClassToClassData(data);
  } catch (error) {
    console.error("Error in createClass:", error);
    
    // Fallback to localStorage if database operation fails
    const classId = `class-${Date.now()}`;
    const newClass: ClassData = {
      id: classId,
      name: classData.name,
      teacherId: classData.teacherId,
      schoolId: classData.schoolId,
      students: classData.students || [],
      isPublic: classData.isPublic !== false,
      description: classData.description || '',
      likes: classData.likes || [],
      createdAt: new Date().toISOString()
    };
    
    // Update localStorage
    const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    localStorage.setItem("classes", JSON.stringify([...existingClasses, newClass]));
    
    return newClass;
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
      
      // Fallback to localStorage
      const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const updatedClasses = existingClasses.map((cls: any) => {
        if (cls.id === classData.id) {
          return classData;
        }
        return cls;
      });
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
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
      return handleDatabaseError(error, (() => {
        const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const updatedClasses = existingClasses.filter((cls: any) => cls.id !== classId);
        localStorage.setItem("classes", JSON.stringify(updatedClasses));
        return true;
      })());
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
      return handleDatabaseError(fetchError, null);
    }
    
    // Prepare updated likes array
    const currentLikes = classData && Array.isArray(classData.likes) ? classData.likes : [];
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
      return handleDatabaseError(updateError, null);
    }
    
    // Map to our ClassData interface
    return mapDbClassToClassData(updatedClass);
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
