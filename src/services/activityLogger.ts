
import { supabase } from "@/integrations/supabase/client";

export type ActivityType = 
  | 'awarded_coins'
  | 'removed_coins'
  | 'assigned_pokemon'
  | 'removed_pokemon'
  | 'added_student_to_class'
  | 'removed_student_from_class'
  | 'created_homework';

export interface ActivityDetails {
  studentId?: string;
  studentName?: string;
  teacherId?: string;
  classId?: string;
  schoolId?: string;
  amount?: number;
  pokemonName?: string;
  homeworkTitle?: string;
}

export const logActivity = async (
  userId: string, // User performing the action (usually teacher)
  activityType: ActivityType,
  details: ActivityDetails,
  isPublic: boolean = true
) => {
  try {
    const { error } = await supabase.from('user_activities').insert({
      user_id: userId,
      activity_type: activityType,
      details,
      is_public: isPublic,
      class_id: details.classId,
      school_id: details.schoolId
    });

    if (error) {
      console.error('Error logging activity:', error.message);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
