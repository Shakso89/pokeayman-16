
import { supabase } from '@/integrations/supabase/client';

export interface StudentProfile {
  user_id: string;
  username: string;
  display_name?: string;
  coins: number;
  spent_coins: number;
  school_id?: string;
  class_id?: string;
  teacher_id?: string;
  avatar_url?: string;
  school_name?: string;
  created_at: string;
  updated_at: string;
}

export const getStudentProfile = async (studentId: string): Promise<StudentProfile | null> => {
  try {
    console.log("🔍 Fetching student profile for:", studentId);
    
    if (!studentId || studentId === 'undefined') {
      console.warn("❌ Invalid studentId provided:", studentId);
      return null;
    }

    // First try student_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    if (profileData && !profileError) {
      console.log("✅ Student profile found in student_profiles");
      return profileData;
    }

    // Fallback to students table and sync to profiles
    console.log("🔄 Profile not found, checking students table...");
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    if (studentError || !studentData) {
      console.error("❌ Student not found in any table:", studentError);
      return null;
    }

    // Sync to student_profiles
    const profileToSync = {
      user_id: studentData.user_id || studentData.id,
      username: studentData.username,
      display_name: studentData.display_name || studentData.username,
      coins: studentData.coins || 0,
      spent_coins: 0,
      school_id: studentData.school_id,
      class_id: studentData.class_id,
      teacher_id: studentData.teacher_id,
      avatar_url: studentData.profile_photo,
      school_name: studentData.school_name
    };

    const { data: syncedProfile, error: syncError } = await supabase
      .from('student_profiles')
      .upsert(profileToSync, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (syncError) {
      console.error("❌ Failed to sync student profile:", syncError);
      return profileToSync as StudentProfile;
    }

    console.log("✅ Student profile synced successfully");
    return syncedProfile;

  } catch (error) {
    console.error("❌ Unexpected error fetching student profile:", error);
    return null;
  }
};

export const updateStudentCoins = async (
  studentId: string,
  newCoins: number,
  spentCoins?: number
): Promise<boolean> => {
  try {
    console.log("💰 Updating student coins:", { studentId, newCoins, spentCoins });

    const updateData: any = { coins: newCoins };
    if (spentCoins !== undefined) {
      updateData.spent_coins = spentCoins;
    }

    const { error } = await supabase
      .from('student_profiles')
      .update(updateData)
      .eq('user_id', studentId);

    if (error) {
      console.error("❌ Failed to update student coins:", error);
      return false;
    }

    console.log("✅ Student coins updated successfully");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error updating student coins:", error);
    return false;
  }
};
