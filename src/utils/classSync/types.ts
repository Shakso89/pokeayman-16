
import { ClassData } from "@/utils/pokemon/classManagement";

// Common types for class synchronization
export interface DbClassResponse {
  id: string;
  name: string;
  teacher_id: string | null;
  school_id: string | null;
  students: string[] | null;
  is_public: boolean | null;
  description: string | null;
  likes: string[] | null;
  created_at: string;
}
