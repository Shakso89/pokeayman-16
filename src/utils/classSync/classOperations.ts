
import { supabase } from "@/integrations/supabase/client";
import { ClassData } from "@/utils/pokemon/classManagement";
import { handleDatabaseError } from "./errorHandling";
import { mapDbClassToClassData } from "./mappers";

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
