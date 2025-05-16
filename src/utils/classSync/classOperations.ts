
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
    // We need to ensure it has the name property and other required fields from Class type
    const insertData = {
      name: classData.name,
      description: classData.description || null,
      teacher_id: classData.teacherId || null,
      school_id: classData.schoolId || null,
      is_public: classData.isPublic || false,
      students: classData.students || [],
      likes: classData.likes || []
    };
    
    const { data, error } = await supabase
      .from("classes")
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      return handleDatabaseError(error, null);
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
      return handleDatabaseError(error, false);
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
      return handleDatabaseError(error, false);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    return false;
  }
};

// Get class by ID
export const getClassById = async (classId: string): Promise<ClassData | null> => {
  try {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single();
    
    if (error) {
      return handleDatabaseError(error, null);
    }
    
    return formatClassData(data as DatabaseClassData);
  } catch (error) {
    console.error("Error fetching class:", error);
    return null;
  }
};
