
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
    
    const { data, error } = await supabase
      .from("classes")
      .insert(dbClassData)
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
    
    const { error } = await supabase
      .from("classes")
      .update(dbUpdates)
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
