
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";
import { ClassData } from "./types";

// Create a new class
export const createClass = async (classData: Omit<ClassData, "id">): Promise<ClassData | null> => {
  try {
    const { data, error } = await supabase
      .from("classes")
      .insert(classData)
      .select()
      .single();
    
    if (error) {
      handleDatabaseError(error);
      return null;
    }
    
    return data as ClassData;
  } catch (error) {
    console.error("Error creating class:", error);
    return null;
  }
};

// Update class details
export const updateClassDetails = async (classId: string, updates: Partial<ClassData>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("classes")
      .update(updates)
      .eq("id", classId);
    
    if (error) {
      handleDatabaseError(error);
      return false;
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
      handleDatabaseError(error);
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
      handleDatabaseError(error);
      return null;
    }
    
    return data as ClassData;
  } catch (error) {
    console.error("Error fetching class:", error);
    return null;
  }
};
