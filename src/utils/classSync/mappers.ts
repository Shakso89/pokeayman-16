
import { ClassData, DatabaseClassData, StudentData, DatabaseStudentData } from "./types";

// Format single class data
export const formatClassData = (classData: DatabaseClassData): ClassData => {
  return {
    id: classData.id,
    name: classData.name,
    description: classData.description || "",
    teacherId: classData.teacher_id || "",
    schoolId: classData.school_id || "",
    createdAt: classData.created_at,
    updatedAt: classData.updated_at || classData.created_at,
    students: classData.students || [],
    isPublic: classData.is_public || false,
    likes: classData.likes || [],
    additionalInfo: {}
  };
};

// Format multiple classes data
export const formatClassesData = (classesData: DatabaseClassData[]): ClassData[] => {
  return classesData.map(formatClassData);
};

// Format single student data
export const formatStudentData = (studentData: DatabaseStudentData): StudentData => {
  return {
    id: studentData.id,
    username: studentData.username,
    display_name: studentData.display_name || "",
    email: studentData.email || undefined,
    class_id: studentData.class_id || undefined,
    school_id: studentData.school_id || undefined,
    teacher_id: studentData.teacher_id || undefined,
    created_at: studentData.created_at,
    updated_at: studentData.updated_at || studentData.created_at,
    is_active: studentData.is_active || true,
    last_login: studentData.last_login || undefined
  };
};

// Format multiple students data
export const formatStudentsData = (studentsData: DatabaseStudentData[]): StudentData[] => {
  return studentsData.map(formatStudentData);
};
