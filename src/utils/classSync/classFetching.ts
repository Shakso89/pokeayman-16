
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";
import { ClassData, StudentData } from "./types";

// Get all students in a class
export const getStudentsInClass = async (classId: string): Promise<StudentData[]> => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId);
    
    if (error) {
      handleDatabaseError(error);
      return [];
    }
    
    return data as StudentData[];
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

// Get all classes for a teacher
export const fetchTeacherClasses = async (teacherId: string): Promise<ClassData[]> => {
  try {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", teacherId);
    
    if (error) {
      handleDatabaseError(error);
      return [];
    }
    
    return data as ClassData[];
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return [];
  }
};
