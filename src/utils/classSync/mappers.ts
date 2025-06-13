
import { ClassData, DatabaseClassData, StudentData, DatabaseStudentData } from "./types";

// Format class data from database format to frontend format
export const formatClassData = (dbClass: DatabaseClassData): ClassData => {
  return {
    id: dbClass.id,
    name: dbClass.name,
    description: dbClass.description || "",
    teacherId: dbClass.teacher_id,
    schoolId: dbClass.school_id || "",
    createdAt: dbClass.created_at,
    updatedAt: dbClass.updated_at || dbClass.created_at,
    students: dbClass.students || [],
    isPublic: dbClass.is_public || false,
    likes: dbClass.likes || [],
    assistants: dbClass.assistants || [],
  };
};

// Format multiple classes data
export const formatClassesData = (dbClasses: DatabaseClassData[]): ClassData[] => {
  return dbClasses.map(formatClassData);
};

// Format student data from database format to frontend format
export const formatStudentData = (dbStudent: DatabaseStudentData): StudentData => {
  return {
    id: dbStudent.id,
    username: dbStudent.username,
    display_name: dbStudent.display_name || dbStudent.username,
    email: dbStudent.email || undefined,
    class_id: dbStudent.class_id || undefined,
    school_id: dbStudent.school_id || undefined,
    teacher_id: dbStudent.teacher_id || undefined,
    created_at: dbStudent.created_at,
    updated_at: dbStudent.updated_at || dbStudent.created_at,
    is_active: dbStudent.is_active || true,
    last_login: dbStudent.last_login || undefined,
  };
};

// Format multiple students data
export const formatStudentsData = (dbStudents: DatabaseStudentData[]): StudentData[] => {
  return dbStudents.map(formatStudentData);
};
