
// Class management functions with Supabase integration
import { supabase } from "@/integrations/supabase/client";

// Define simple interfaces for our class data to avoid deep typing issues
export interface ClassData {
  id: string;
  name: string;
  schoolId: string;
  teacherId?: string;
}

// Define explicit interface for what Supabase returns
export interface SupabaseClassData {
  id: string;
  name: string;
  school_id: string;
  teacher_id?: string;
  created_at: string;
}

// Check if a class exists
export const classExists = async (classData: ClassData): Promise<boolean> => {
  try {
    // First try Supabase
    const { data, error } = await supabase
      .from('classes')
      .select('id')
      .eq('name', classData.name)
      .eq('school_id', classData.schoolId);
      
    if (error) {
      console.error("Error checking if class exists in database:", error);
      
      // Simple inline type with minimal structure to avoid excessive type instantiation
      const allClasses: {name: string; schoolId: string}[] = 
        JSON.parse(localStorage.getItem("classes") || "[]");
      
      return allClasses.some(cls => 
        cls.name === classData.name && cls.schoolId === classData.schoolId
      );
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Exception in classExists:", error);
    
    // Simple inline type with minimal structure to avoid excessive type instantiation
    const allClasses: {name: string; schoolId: string}[] = 
      JSON.parse(localStorage.getItem("classes") || "[]");
    
    return allClasses.some(cls => 
      cls.name === classData.name && cls.schoolId === classData.schoolId
    );
  }
};

// Save a class to database and localStorage
export const saveClass = async (classData: ClassData): Promise<{success: boolean; classId?: string; message?: string}> => {
  try {
    // Check if class already exists
    const exists = await classExists(classData);
    if (exists) {
      return { success: false, message: "A class with this name already exists" };
    }
    
    // Try to save to Supabase
    const { data, error } = await supabase
      .from('classes')
      .insert({
        id: classData.id,
        name: classData.name,
        school_id: classData.schoolId,
        teacher_id: classData.teacherId
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error saving class to database:", error);
      
      // Define a simple array type directly
      const allClasses: ClassData[] = JSON.parse(localStorage.getItem("classes") || "[]");
      allClasses.push(classData);
      localStorage.setItem("classes", JSON.stringify(allClasses));
      
      return { success: true, classId: classData.id };
    }
    
    return { success: true, classId: data.id };
  } catch (error) {
    console.error("Error saving class:", error);
    
    // Fallback to localStorage with direct typing
    try {
      const allClasses: ClassData[] = JSON.parse(localStorage.getItem("classes") || "[]");
      allClasses.push(classData);
      localStorage.setItem("classes", JSON.stringify(allClasses));
      
      return { success: true, classId: classData.id };
    } catch (error) {
      console.error("Error saving class to localStorage:", error);
      return { success: false, message: "Error saving class data" };
    }
  }
};

// Get classes for a school
export const getClassesForSchool = async (schoolId: string): Promise<ClassData[]> => {
  try {
    // Try to get from Supabase
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId);
      
    if (error) {
      console.error("Error fetching classes from database:", error);
      
      // Simpler type declaration 
      type SimpleClass = {
        id: string; 
        name: string; 
        schoolId: string; 
        teacherId?: string;
      };
      
      const allClasses: SimpleClass[] = JSON.parse(localStorage.getItem("classes") || "[]");
      return allClasses.filter(cls => cls.schoolId === schoolId);
    }
    
    // Cast Supabase data to our known type and transform to ClassData format
    const typedData = data as SupabaseClassData[];
    
    return typedData.map((item) => ({
      id: item.id,
      name: item.name,
      schoolId: item.school_id,
      teacherId: item.teacher_id
    }));
  } catch (error) {
    console.error("Error fetching classes:", error);
    
    // Simpler type declaration
    type SimpleClass = {
      id: string; 
      name: string; 
      schoolId: string; 
      teacherId?: string;
    };
    
    const allClasses: SimpleClass[] = JSON.parse(localStorage.getItem("classes") || "[]");
    return allClasses.filter(cls => cls.schoolId === schoolId);
  }
};

// Delete a class
export const deleteClass = async (classId: string): Promise<boolean> => {
  try {
    // Try to delete from Supabase
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
      
    if (error) {
      console.error("Error deleting class from database:", error);
      
      // Simple inline type
      const allClasses: {id: string}[] = JSON.parse(localStorage.getItem("classes") || "[]");
      
      const updatedClasses = allClasses.filter(cls => cls.id !== classId);
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    
    // Fallback to localStorage
    try {
      // Simple inline type
      const allClasses: {id: string}[] = JSON.parse(localStorage.getItem("classes") || "[]");
      
      const updatedClasses = allClasses.filter(cls => cls.id !== classId);
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
      
      return true;
    } catch (error) {
      console.error("Error deleting class from localStorage:", error);
      return false;
    }
  }
};
