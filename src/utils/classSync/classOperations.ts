import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";
import { ClassData, DatabaseClassData } from "./types";
import { formatClassData } from "./mappers";

// Helper to convert ClassData to DatabaseClassData
const toDbFormat = (classData: Partial<ClassData>): Partial<DatabaseClassData> => {
  const { teacherId, schoolId, createdAt, updatedAt, isPublic, additionalInfo, ...restData } = classData;
  return {
    ...restData,
    teacher_id: teacherId,
    school_id: schoolId,
    created_at: createdAt,
    updated_at: updatedAt,
    is_public: isPublic,
    // Handle additional_info if needed
  };
};

// Create a new class
export const createClass = async (classData: Omit<ClassData, "id">): Promise<ClassData | null> => {
  try {
    const dbClassData = toDbFormat(classData);
    
    // Create a properly typed object that satisfies Supabase's requirements
    const insertData = {
      name: classData.name,
      description: classData.description || null, // Allow empty description
      teacher_id: classData.teacherId || null, // Allow null for admin users
      school_id: classData.schoolId || null,
      is_public: classData.isPublic || false,
      students: classData.students || [],
      likes: classData.likes || [],
      created_at: classData.createdAt || new Date().toISOString(),
      updated_at: classData.updatedAt || new Date().toISOString() // Ensure updated_at is set
    };
    
    // Check if current user is admin based on localStorage flag
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    console.log("Creating class with admin status:", isAdmin);
    
    // Log the data being sent to Supabase
    console.log("Class insert data:", insertData);
    
    const { data, error } = await supabase
      .from("classes")
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating class in Supabase:", error);
      
      // If there's an error and we're not in admin mode, or the error is not related to foreign key constraint
      if (!isAdmin || !error.message.includes("foreign key constraint")) {
        return handleDatabaseError(error, null);
      }
      
      // For admins, try fallback to localStorage if Supabase fails
      console.log("Admin user detected, falling back to localStorage for class creation");
      
      // Generate a UUID for the class
      const id = crypto.randomUUID();
      const currentTime = new Date().toISOString();
      const newClass: ClassData = {
        id,
        name: classData.name,
        description: classData.description || "",
        schoolId: classData.schoolId || "",
        teacherId: null, // Set teacherId to null for admin-created classes
        students: classData.students || [],
        isPublic: classData.isPublic || false,
        likes: classData.likes || [],
        createdAt: currentTime,
        updatedAt: currentTime
      };
      
      // Store in localStorage
      const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      localStorage.setItem("classes", JSON.stringify([...existingClasses, newClass]));
      
      return newClass;
    }
    
    return formatClassData(data as DatabaseClassData);
  } catch (error) {
    console.error("Error creating class:", error);
    return null;
  }
};

// Update class details
export const updateClassDetails = async (classId: string, updates: Partial<ClassData>): Promise<boolean> => {
  try {
    const dbUpdates = toDbFormat(updates);
    
    // Make sure we have an object that Supabase can handle
    const supabaseUpdates = Object.keys(dbUpdates).length > 0 ? dbUpdates : { updated_at: new Date().toISOString() };
    
    const { error } = await supabase
      .from("classes")
      .update(supabaseUpdates)
      .eq("id", classId);
    
    if (error) {
      console.error("Error updating class in Supabase:", error);
      
      // Fallback to localStorage if Supabase update fails
      try {
        const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const updatedClasses = existingClasses.map((cls: ClassData) => {
          if (cls.id === classId) {
            return { ...cls, ...updates };
          }
          return cls;
        });
        
        localStorage.setItem("classes", JSON.stringify(updatedClasses));
        return true;
      } catch (localStorageError) {
        return handleDatabaseError(error, false);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error updating class:", error);
    return false;
  }
};

// Remove a class
export const removeClass = async (classId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", classId);
    
    if (error) {
      console.error("Error deleting class in Supabase:", error);
      
      // Fallback to localStorage if Supabase delete fails
      try {
        const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const filteredClasses = existingClasses.filter((cls: ClassData) => cls.id !== classId);
        
        localStorage.setItem("classes", JSON.stringify(filteredClasses));
        return true;
      } catch (localStorageError) {
        return handleDatabaseError(error, false);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    return false;
  }
};

// Get class by ID - Fix to correctly handle class data format and errors
export const getClassById = async (classId: string): Promise<ClassData | null> => {
  try {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single();
    
    if (error) {
      console.error("Error fetching class from Supabase:", error);
      
      // Fallback to localStorage if Supabase fetch fails
      try {
        const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const foundClass = existingClasses.find((cls: any) => cls.id === classId);
        
        if (foundClass) {
          // Ensure the class has the updatedAt field
          if (!foundClass.updatedAt && foundClass.createdAt) {
            foundClass.updatedAt = foundClass.createdAt;
          }
          return foundClass;
        }
      } catch (localStorageError) {
        console.error("Error accessing localStorage:", localStorageError);
      }
      
      return handleDatabaseError(error, null);
    }
    
    return formatClassData(data as DatabaseClassData);
  } catch (error) {
    console.error("Error fetching class:", error);
    return null;
  }
};

// Get all classes for a school
export const getClassesBySchool = async (schoolId: string): Promise<ClassData[]> => {
  try {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("school_id", schoolId);
    
    if (error) {
      console.error("Error fetching classes from Supabase:", error);
      
      // Fallback to localStorage if Supabase fetch fails
      try {
        const existingClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        return existingClasses.filter((cls: ClassData) => cls.schoolId === schoolId);
      } catch (localStorageError) {
        console.error("Error accessing localStorage:", localStorageError);
        return [];
      }
    }
    
    return data.map(formatClassData);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
};
