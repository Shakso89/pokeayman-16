
import { ClassData, DatabaseClassData, StudentData, DatabaseStudentData } from "./types";

// Format a single class object from database format to frontend format
export const formatClassData = (dbClass: DatabaseClassData): ClassData => {
  return {
    id: dbClass.id,
    name: dbClass.name,
    description: dbClass.description || "",
    teacherId: dbClass.teacher_id || null,
    schoolId: dbClass.school_id || "",
    students: dbClass.students || [],
    isPublic: dbClass.is_public || false,
    likes: dbClass.likes || [],
    createdAt: dbClass.created_at,
    updatedAt: dbClass.updated_at || dbClass.created_at, // Use created_at as fallback if updated_at is not available
    additionalInfo: {}
  };
};

// Format multiple class objects
export const formatClassesData = (dbClasses: DatabaseClassData[]): ClassData[] => {
  return dbClasses.map(formatClassData);
};

// Format a single student object from database format to frontend format
export const formatStudentData = (dbStudent: DatabaseStudentData): StudentData => {
  return {
    id: dbStudent.id,
    username: dbStudent.username,
    display_name: dbStudent.display_name || dbStudent.username,
    email: dbStudent.email,
    class_id: dbStudent.class_id,
    school_id: dbStudent.school_id,
    teacher_id: dbStudent.teacher_id,
    created_at: dbStudent.created_at,
    updated_at: dbStudent.updated_at || dbStudent.created_at, // Use created_at as fallback
    is_active: dbStudent.is_active
  };
};

// Format multiple student objects
export const formatStudentsData = (dbStudents: DatabaseStudentData[]): StudentData[] => {
  return dbStudents.map(formatStudentData);
};
