
import { ClassData } from "@/utils/pokemon/classManagement";
import { DbClassResponse } from "./types";

// Helper function to convert database class to ClassData format
export const mapDbClassToClassData = (dbClass: DbClassResponse): ClassData => {
  return {
    id: dbClass.id,
    name: dbClass.name,
    teacherId: dbClass.teacher_id || null,
    schoolId: dbClass.school_id || '',
    students: dbClass.students || [],
    isPublic: dbClass.is_public !== false,
    description: dbClass.description || '',
    likes: dbClass.likes || [],
    createdAt: dbClass.created_at
  };
};
