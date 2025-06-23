
import { ClassData, DatabaseClassData, StudentData, DatabaseStudentData } from "./types";

// Convert database format to frontend format for a single class
export const formatClassData = (dbClass: DatabaseClassData): ClassData => {
  return {
    id: dbClass.id,
    name: dbClass.name,
    description: dbClass.description || "",
    teacher_id: dbClass.teacher_id,
    school_id: dbClass.school_id || "",
    created_at: dbClass.created_at,
    updated_at: dbClass.updated_at || dbClass.created_at,
    students: dbClass.students || [],
    is_public: dbClass.is_public !== false,
    likes: dbClass.likes || [],
    assistants: dbClass.assistants || []
  };
};

// Convert database format to frontend format for multiple classes
export const formatClassesData = (dbClasses: DatabaseClassData[]): ClassData[] => {
  return dbClasses.map(formatClassData);
};

// Convert database format to frontend format for a single student
export const formatStudentData = (dbStudent: DatabaseStudentData): StudentData => {
  return {
    id: dbStudent.id,
    username: dbStudent.username,
    display_name: dbStudent.display_name,
    class_id: dbStudent.class_id,
    school_id: dbStudent.school_id,
    teacher_id: dbStudent.teacher_id,
    coins: dbStudent.coins || 0,
    created_at: dbStudent.created_at,
    is_active: dbStudent.is_active !== false,
    profile_photo: dbStudent.profile_photo
  };
};

// Convert database format to frontend format for multiple students
export const formatStudentsData = (dbStudents: DatabaseStudentData[]): StudentData[] => {
  return dbStudents.map(formatStudentData);
};
