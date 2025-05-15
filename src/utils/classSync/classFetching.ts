
import { supabase } from "@/integrations/supabase/client";
import { ClassData } from "@/utils/pokemon/classManagement";
import { handleDatabaseError } from "./errorHandling";
import { mapDbClassToClassData } from "./mappers";

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
