
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";
import { ClassData, DatabaseClassData } from "./types";
import { formatClassData } from "./mappers";

// Helper to convert ClassData to DatabaseClassData
const toDbFormat = (classData: Partial<ClassData>): Partial<DatabaseClassData> => {
  const { teacherId, schoolId, createdAt, updatedAt, isPublic, assistants, ...restData } = classData;
  return {
    ...restData,
    teacher_id: teacherId,
    school_id: schoolId,
    created_at: createdAt,
    updated_at: updatedAt,
    is_public: isPublic,
    assistants: assistants,
  };
};

// Create a new class
export const createClass = async (classData: Omit<ClassData, "id">): Promise<ClassData | null> => {
  try {
    console.log("Creating class with data:", classData);
    
    const insertData = {
      name: classData.name,
      description: classData.description || null,
      teacher_id: classData.teacherId || null,
      school_id: classData.schoolId || null,
      is_public: classData.isPublic || false,
      students: classData.students || [],
      likes: classData.likes || [],
      assistants: classData.assistants || [],
      created_at: classData.createdAt || new Date().toISOString(),
    };
    
    console.log("Class insert data:", insertData);
    
    const { data, error } = await supabase
      .from("classes")
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating class in Supabase:", error);
      return null;
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
    const { updated_at, ...safeUpdates } = dbUpdates as any;
    const supabaseUpdates = Object.keys(safeUpdates).length > 0 ? safeUpdates : {};
    
    const { error } = await supabase
      .from("classes")
      .update(supabaseUpdates)
      .eq("id", classId);
    
    if (error) {
      console.error("Error updating class in Supabase:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating class:", error);
    return false;
  }
};

// Add assistant to class
export const addAssistantToClass = async (classId: string, assistantId: string): Promise<boolean> => {
  try {
    // First get current assistants
    const { data: classData, error: fetchError } = await supabase
      .from("classes")
      .select("assistants")
      .eq("id", classId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching class:", fetchError);
      return false;
    }
    
    const currentAssistants = classData.assistants || [];
    if (currentAssistants.includes(assistantId)) {
      console.log("Assistant already exists in class");
      return true;
    }
    
    const updatedAssistants = [...currentAssistants, assistantId];
    
    const { error } = await supabase
      .from("classes")
      .update({ assistants: updatedAssistants })
      .eq("id", classId);
    
    if (error) {
      console.error("Error adding assistant:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding assistant to class:", error);
    return false;
  }
};

// Remove assistant from class
export const removeAssistantFromClass = async (classId: string, assistantId: string): Promise<boolean> => {
  try {
    const { data: classData, error: fetchError } = await supabase
      .from("classes")
      .select("assistants")
      .eq("id", classId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching class:", fetchError);
      return false;
    }
    
    const currentAssistants = classData.assistants || [];
    const updatedAssistants = currentAssistants.filter((id: string) => id !== assistantId);
    
    const { error } = await supabase
      .from("classes")
      .update({ assistants: updatedAssistants })
      .eq("id", classId);
    
    if (error) {
      console.error("Error removing assistant:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error removing assistant from class:", error);
    return false;
  }
};

// Delete a class - only class creator can delete
export const deleteClass = async (classId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", classId);
    
    if (error) {
      console.error("Error deleting class in Supabase:", error);
      return false;
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
      console.error("Error fetching class from Supabase:", error);
      return null;
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
    console.log(`Fetching classes for school: ${schoolId}`);
    
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("school_id", schoolId);
    
    if (error) {
      console.error("Error fetching classes from Supabase:", error);
      return [];
    }
    
    return data.map(formatClassData);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
};

// Get classes where user is teacher or assistant
export const getClassesForUser = async (userId: string): Promise<ClassData[]> => {
  try {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .or(`teacher_id.eq.${userId},assistants.cs.{${userId}}`);
    
    if (error) {
      console.error("Error fetching user classes:", error);
      return [];
    }
    
    return data.map(formatClassData);
  } catch (error) {
    console.error("Error fetching user classes:", error);
    return [];
  }
};
