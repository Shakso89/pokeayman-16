
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { getValidUUID } from "@/components/teacher/dashboard/student/studentUtils";

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
export const classExists = async (classData: Partial<ClassData>): Promise<boolean> => {
  // Skip the check if no school ID or name is provided
  if (!classData.schoolId || !classData.name) {
    return false;
  }
  
  try {
    const teacherId = classData.teacherId || null;
    // First try to use Supabase
    const { data, error } = await supabase
      .from('classes')
      .select('name')
      .eq('name', classData.name)
      .eq('school_id', classData.schoolId);
    
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
 * Updated to accept partial ClassData without requiring id
 */
export const saveClass = async (classData: Omit<ClassData, "id">): Promise<ClassData> => {
  // Create a complete ClassData with a new UUID
  const completeClassData: ClassData = {
    ...classData,
    id: uuidv4()
  };
  
  // Ensure the teacherId is a valid UUID
  if (completeClassData.teacherId) {
    completeClassData.teacherId = getValidUUID(completeClassData.teacherId);
  }
  
  try {
    // First try to use Supabase
    const { data, error } = await supabase
      .from('classes')
      .insert({
        id: completeClassData.id,
        name: completeClassData.name,
        teacher_id: completeClassData.teacherId || null,
        school_id: completeClassData.schoolId || null,
        description: completeClassData.description || null,
        students: completeClassData.students || [],
        is_public: completeClassData.isPublic !== false,
        likes: completeClassData.likes || []
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error saving class to database:", error);
      
      // Fallback to localStorage
      const allClasses: ClassData[] = JSON.parse(localStorage.getItem("classes") || "[]");
      allClasses.push(completeClassData);
      localStorage.setItem("classes", JSON.stringify(allClasses));
      
      return completeClassData;
    }
    
    // Return properly structured ClassData
    if (data) {
      return mapDatabaseClassToClassData(data);
    } else {
      return completeClassData;
    }
  } catch (error) {
    console.error("Error saving class:", error);
    
    // Fallback to localStorage with direct typing
    try {
      const allClasses: ClassData[] = JSON.parse(localStorage.getItem("classes") || "[]");
      allClasses.push(completeClassData);
      localStorage.setItem("classes", JSON.stringify(allClasses));
      
      return completeClassData;
    } catch (localStorageError) {
      console.error("Error saving to localStorage:", localStorageError);
      return completeClassData; // Return original data as a fallback
    }
  }
};

/**
 * Gets all classes for a school by school ID
 */
export const getClassesBySchoolId = async (schoolId: string): Promise<ClassData[]> => {
  try {
    // First try to use Supabase
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId);
    
    if (error) {
      console.error("Error fetching classes from Supabase:", error);
      // Fallback to localStorage
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
    console.log(`Attempting to delete class with ID: ${classId}`);
    
    // First try to use Supabase
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
    
    if (error) {
      console.error("Supabase error in deleteClass:", error);
      
      // Fallback to localStorage
      console.log("Falling back to localStorage for class deletion");
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      
      // Log class info before deletion
      const classToDelete = allClasses.find((cls: any) => cls.id === classId);
      console.log("Class to delete:", classToDelete);
      
      const updatedClasses = allClasses.filter((cls: any) => cls.id !== classId);
      console.log(`Classes before: ${allClasses.length}, after: ${updatedClasses.length}`);
      
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
      
      // Also update any students that were in this class
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const updatedStudents = allStudents.map((student: any) => {
        if (student.classId === classId) {
          console.log(`Updating student ${student.id} to remove class reference`);
          return { ...student, classId: null };
        }
        return student;
      });
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      
      return true;
    }
    
    // If Supabase deletion was successful, also update any students in localStorage
    try {
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const updatedStudents = allStudents.map((student: any) => {
        if (student.classId === classId) {
          return { ...student, classId: null };
        }
        return student;
      });
      localStorage.setItem("students", JSON.stringify(updatedStudents));
    } catch (e) {
      console.error("Error updating students in localStorage:", e);
    }
    
    console.log(`Successfully deleted class with ID: ${classId}`);
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    
    // Fallback to localStorage
    try {
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const updatedClasses = allClasses.filter((cls: any) => cls.id !== classId);
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
      
      // Also update any students that were in this class
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const updatedStudents = allStudents.map((student: any) => {
        if (student.classId === classId) {
          return { ...student, classId: null };
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
