
import { ClassData } from "./types";

// Format single class data
export const formatClassData = (classData: any): ClassData => {
  return {
    id: classData.id,
    name: classData.name,
    description: classData.description || "",
    teacherId: classData.teacher_id,
    schoolId: classData.school_id,
    createdAt: classData.created_at,
    updatedAt: classData.updated_at,
    additionalInfo: classData.additional_info || {}
  };
};

// Format multiple classes data
export const formatClassesData = (classesData: any[]): ClassData[] => {
  return classesData.map(formatClassData);
};
