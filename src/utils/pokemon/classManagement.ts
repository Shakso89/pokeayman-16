
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { getValidUUID } from "@/components/teacher/dashboard/student/studentUtils";

// Define a simpler interface to avoid excessive type instantiation
export interface ClassData {
  id: string;
  name: string;
  schoolId: string;
  teacherId?: string;
  students?: string[]; // Add students property
  isPublic?: boolean;  // Add isPublic property
  description?: string; // Add description property
  likes?: string[];     // Add likes property
  createdAt?: string;   // Add createdAt property
}

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
      console.error("Error checking if class exists in database:", error);
      
      // Use direct type annotation to avoid excessive instantiation
      const allClasses: {name: string; schoolId: string}[] = 
        JSON.parse(localStorage.getItem("classes") || "[]");
      
      return allClasses.some(cls => 
        cls.name === classData.name && cls.schoolId === classData.schoolId
      );
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
      
      // Use direct type annotation to avoid excessive instantiation
      const allClasses: ClassData[] = JSON.parse(localStorage.getItem("classes") || "[]");
      allClasses.push(classData);
      localStorage.setItem("classes", JSON.stringify(allClasses));
      
      return classData;
    }
    
    // Convert the Supabase response to our ClassData interface
    return {
      id: data.id,
      name: data.name,
      schoolId: data.school_id || classData.schoolId,
      teacherId: data.teacher_id,
      students: data.students || [],
      isPublic: data.is_public !== false,
      description: data.description || '',
      likes: data.likes || [],
      createdAt: data.created_at
    };
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
      console.error("Error fetching classes from database:", error);
      
      // Use a simpler type definition to avoid excessive instantiation
      interface SimpleClass {
        id: string;
        name: string;
        schoolId: string;
        teacherId?: string;
      }
      
      const allClasses: SimpleClass[] = JSON.parse(localStorage.getItem("classes") || "[]");
      return allClasses.filter(cls => cls.schoolId === schoolId);
    }
    
    // Map Supabase data to ClassData interface
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      schoolId: item.school_id || schoolId,
      teacherId: item.teacher_id,
      students: item.students || [],
      isPublic: item.is_public !== false,
      description: item.description || '',
      likes: item.likes || [],
      createdAt: item.created_at
    }));
    
  } catch (error) {
    console.error("Error fetching classes:", error);
    
    // Use a simpler type definition to avoid excessive instantiation
    interface SimpleClass {
      id: string;
      name: string;
      schoolId: string;
      teacherId?: string;
    }
    
    const allClasses: SimpleClass[] = JSON.parse(localStorage.getItem("classes") || "[]");
    return allClasses.filter(cls => cls.schoolId === schoolId);
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
      console.error("Error deleting class from database:", error);
      
      // Use direct type annotation to avoid excessive instantiation
      const allClasses: {id: string}[] = JSON.parse(localStorage.getItem("classes") || "[]");
      
      const updatedClasses = allClasses.filter(cls => cls.id !== classId);
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    
    // Fallback to localStorage
    try {
      // Use direct type annotation to avoid excessive instantiation
      const allClasses: {id: string}[] = JSON.parse(localStorage.getItem("classes") || "[]");
      
      const updatedClasses = allClasses.filter(cls => cls.id !== classId);
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
      
      return true;
    } catch (localStorageError) {
      console.error("Error updating localStorage:", localStorageError);
      return false;
    }
  }
};
