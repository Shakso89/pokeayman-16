
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { getValidUUID } from "@/components/teacher/dashboard/student/studentUtils";
// Remove the Class import since it's not exported from custom-types
// import { Class } from "@/integrations/supabase/custom-types";

// Define a simpler interface to avoid excessive type instantiation
export interface ClassData {
  id: string;
  name: string;
  schoolId: string;
  teacherId: string | null;
  students: string[]; 
  isPublic: boolean;  
  description: string; 
  likes: string[];     
  createdAt?: string;   
}

// Helper function to safely handle Supabase error responses
const handleSupabaseError = (error: any, fallback: any) => {
  console.error("Supabase error:", error);
  return fallback;
};

/**
 * Checks if a class with the same name already exists in the specified school
 */
export const classExists = async (classData: ClassData): Promise<boolean> => {
  // Skip the check if no school ID is provided
  if (!classData.schoolId) {
    return false;
  }
  
  try {
    const teacherId = classData.teacherId || null;
    // First try to use Supabase
    const { data, error } = await supabase
      .from('classes')
      .select('name')
      .eq('name', classData.name)
      .eq('teacher_id', teacherId);
    
    if (error) {
      return handleSupabaseError(error, JSON.parse(localStorage.getItem("classes") || "[]")
        .some((cls: any) => cls.name === classData.name && cls.schoolId === classData.schoolId));
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Exception in classExists:", error);
    
    // Use direct type annotation to avoid excessive instantiation
    const allClasses: {name: string; schoolId: string}[] = 
      JSON.parse(localStorage.getItem("classes") || "[]");
    
    return allClasses.some(cls => 
      cls.name === classData.name && cls.schoolId === classData.schoolId
    );
  }
};

/**
 * Maps database class format to application ClassData format
 */
const mapDatabaseClassToClassData = (dbClass: any): ClassData => {
  return {
    id: dbClass.id,
    name: dbClass.name,
    schoolId: dbClass.school_id || '',
    teacherId: dbClass.teacher_id || null,
    students: dbClass.students || [],
    isPublic: dbClass.is_public !== false,
    description: dbClass.description || '',
    likes: dbClass.likes || [],
    createdAt: dbClass.created_at
  };
};

/**
 * Saves a class to the database
 */
export const saveClass = async (classData: ClassData): Promise<ClassData> => {
  // If the class doesn't have an ID, generate a unique ID
  if (!classData.id) {
    classData.id = uuidv4();
  }
  
  // Ensure the teacherId is a valid UUID
  if (classData.teacherId) {
    classData.teacherId = getValidUUID(classData.teacherId);
  }
  
  try {
    // First try to use Supabase
    const { data, error } = await supabase
      .from('classes')
      .insert({
        id: classData.id,
        name: classData.name,
        teacher_id: classData.teacherId || null,
        school_id: classData.schoolId || null,
        description: classData.description || null,
        students: classData.students || [],
        is_public: classData.isPublic !== false,
        likes: classData.likes || []
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error saving class to database:", error);
      
      // Fallback to localStorage
      const allClasses: ClassData[] = JSON.parse(localStorage.getItem("classes") || "[]");
      allClasses.push(classData);
      localStorage.setItem("classes", JSON.stringify(allClasses));
      
      return classData;
    }
    
    // Return properly structured ClassData
    if (data) {
      return mapDatabaseClassToClassData(data);
    } else {
      return classData;
    }
  } catch (error) {
    console.error("Error saving class:", error);
    
    // Fallback to localStorage with direct typing
    try {
      const allClasses: ClassData[] = JSON.parse(localStorage.getItem("classes") || "[]");
      allClasses.push(classData);
      localStorage.setItem("classes", JSON.stringify(allClasses));
      
      return classData;
    } catch (localStorageError) {
      console.error("Error saving to localStorage:", localStorageError);
      return classData; // Return original data as a fallback
    }
  }
};

/**
 * Gets all classes for a school by school ID
 * This is the renamed function (previously getClassesForSchool)
 */
export const getClassesBySchoolId = async (schoolId: string): Promise<ClassData[]> => {
  try {
    // First try to use Supabase
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId);
    
    if (error) {
      return handleSupabaseError(error, JSON.parse(localStorage.getItem("classes") || "[]")
        .filter((cls: any) => cls.schoolId === schoolId)
        .map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          schoolId: cls.schoolId,
          teacherId: cls.teacherId || null,
          students: cls.students || [],
          isPublic: cls.isPublic !== false,
          description: cls.description || '',
          likes: cls.likes || [],
          createdAt: cls.createdAt
        })));
    }
    
    // Map Supabase data to ClassData interface
    return (data || []).map(mapDatabaseClassToClassData);
    
  } catch (error) {
    console.error("Error fetching classes:", error);
    
    // Fallback to localStorage with proper type conversion
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    
    return allClasses
      .filter((cls: any) => cls.schoolId === schoolId)
      .map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        schoolId: cls.schoolId,
        teacherId: cls.teacherId || null,
        students: cls.students || [],
        isPublic: cls.isPublic !== false,
        description: cls.description || '',
        likes: cls.likes || [],
        createdAt: cls.createdAt
      }));
  }
};

export const deleteClass = async (classId: string): Promise<boolean> => {
  try {
    // First try to use Supabase
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
    
    if (error) {
      return handleSupabaseError(error, (() => {
        const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const updatedClasses = allClasses.filter((cls: any) => cls.id !== classId);
        localStorage.setItem("classes", JSON.stringify(updatedClasses));
        return true;
      })());
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    
    // Fallback to localStorage
    try {
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const updatedClasses = allClasses.filter((cls: any) => cls.id !== classId);
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
      return true;
    } catch (localStorageError) {
      console.error("Error updating localStorage:", localStorageError);
      return false;
    }
  }
};
