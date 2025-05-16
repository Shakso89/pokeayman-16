
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./errorHandling";
import { ClassData, StudentData, DatabaseClassData, DatabaseStudentData } from "./types";
import { formatClassesData, formatStudentsData } from "./mappers";

// Get all students in a class
export const getStudentsInClass = async (classId: string): Promise<StudentData[]> => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId);
    
    if (error) {
      return handleDatabaseError(error, [] as StudentData[]);
    }
    
    return formatStudentsData(data as DatabaseStudentData[]);
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
      return handleDatabaseError(error, [] as ClassData[]);
    }
    
    return formatClassesData(data as DatabaseClassData[]);
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return [];
  }
};
