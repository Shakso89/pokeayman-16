
import { ClassData, DatabaseClassData } from "./types";

// Convert database format to frontend format
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
