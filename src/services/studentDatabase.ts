import { supabase } from "@/integrations/supabase/client";
import { assignPokemonFromPool } from "./schoolPokemonService";

export interface StudentProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  coins: number;
  school_id?: string;
  class_id?: string;
  avatar_url?: string;
}

export interface Achievement {
  id: string;
  student_id: string;
  type: string;
  value: number;
  is_active: boolean;
  awarded_at: string;
  awarded_by?: string;
  class_id?: string;
  school_id?: string;
  metadata?: any;
}

export interface MysteryBallHistoryRecord {
  id: string;
  student_id: string;
  result_type: string;
  type: string;
  pokemon_name?: string;
  pokemon_id?: string;
  pokemon_data?: any;
  coins_amount?: number;
  created_at: string;
}

// Get or create student profile - now properly handles the user_id column and class_id assignment
export const getOrCreateStudentProfile = async (
  userId: string,
  classId?: string,
  schoolId?: string
): Promise<StudentProfile | null> => {
  try {
    console.log("🔍 Getting or creating student profile for user:", userId);

    // Validate input
    if (!userId || userId === 'undefined') {
      console.error("❌ Invalid userId provided:", userId);
      return null;
    }

    // First try to get existing student by user_id
    console.log("🔍 Checking for existing student by user_id...");
    let { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (student) {
      console.log("✅ Found existing student profile:", {
        id: student.id,
        user_id: student.user_id,
        username: student.username,
        coins: student.coins || 0,
        class_id: student.class_id
      });
      
      // If classId is provided and student doesn't have one, update it
      if (classId && !student.class_id) {
        console.log("📝 Updating student with class_id:", classId);
        await updateStudentClassId(student.id, classId);
        student.class_id = classId;
      }
      
      // Ensure student profile exists in student_profiles table
      await ensureStudentProfileExists(student, classId, schoolId);
      
      return {
        id: student.id,
        user_id: student.user_id,
        username: student.username,
        display_name: student.display_name,
        coins: student.coins || 0,
        school_id: student.school_id,
        class_id: student.class_id,
        avatar_url: student.profile_photo
      };
    }

    // If not found by user_id, try by id (for backward compatibility)
    if (error && error.code !== 'PGRST116') {
      console.log("🔍 Trying to find student by id...");
      const { data: studentById, error: idError } = await supabase
        .from("students")
        .select("*")
        .eq("id", userId)
        .single();

      if (studentById) {
        console.log("✅ Found existing student by id:", {
          id: studentById.id,
          user_id: studentById.user_id,
          username: studentById.username
        });
        
        // If classId is provided and student doesn't have one, update it
        if (classId && !studentById.class_id) {
          console.log("📝 Updating student with class_id:", classId);
          await updateStudentClassId(studentById.id, classId);
          studentById.class_id = classId;
        }
        
        await ensureStudentProfileExists(studentById, classId, schoolId);
        
        return {
          id: studentById.id,
          user_id: studentById.user_id || studentById.id,
          username: studentById.username,
          display_name: studentById.display_name,
          coins: studentById.coins || 0,
          school_id: studentById.school_id,
          class_id: studentById.class_id,
          avatar_url: studentById.profile_photo
        };
      }
    }

    // If no student found, this means we need to create one
    console.log("📝 No existing student found, this should not happen in normal flow");
    console.error("❌ Student not found for userId:", userId);
    return null;
    
  } catch (error) {
    console.error("❌ Unexpected error in getOrCreateStudentProfile:", error);
    return null;
  }
};

// New function to update student class_id
const updateStudentClassId = async (studentId: string, classId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("students")
      .update({ class_id: classId })
      .eq("id", studentId);

    if (error) {
      console.error("❌ Error updating student class_id:", error);
    } else {
      console.log("✅ Student class_id updated successfully");
    }
  } catch (error) {
    console.error("❌ Error in updateStudentClassId:", error);
  }
};

// Ensure student profile exists in student_profiles table
const ensureStudentProfileExists = async (student: any, classId?: string, schoolId?: string): Promise<void> => {
  try {
    const userId = student.user_id || student.id;
    const finalClassId = classId || student.class_id;
    const finalSchoolId = schoolId || student.school_id;
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!existingProfile) {
      console.log("📝 Creating student profile entry for user:", userId);
      
      const { error: insertError } = await supabase
        .from("student_profiles")
        .insert({
          user_id: userId,
          username: student.username,
          display_name: student.display_name || student.username,
          school_id: finalSchoolId,
          class_id: finalClassId,
          coins: student.coins || 0,
          spent_coins: 0
        });

      if (insertError) {
        console.error("❌ Error creating student profile:", insertError);
      } else {
        console.log("✅ Student profile created successfully");
      }
    } else {
      // Update existing profile with class_id if provided
      if (finalClassId || finalSchoolId) {
        console.log("📝 Updating existing student profile with class/school info");
        
        const updateData: any = {};
        if (finalClassId) updateData.class_id = finalClassId;
        if (finalSchoolId) updateData.school_id = finalSchoolId;
        
        const { error: updateError } = await supabase
          .from("student_profiles")
          .update(updateData)
          .eq("user_id", userId);

        if (updateError) {
          console.error("❌ Error updating student profile:", updateError);
        } else {
          console.log("✅ Student profile updated successfully");
        }
      }
    }
  } catch (error) {
    console.error("❌ Error ensuring student profile exists:", error);
  }
};

// Get student profile by ID
export const getStudentProfileById = async (studentId: string): Promise<StudentProfile | null> => {
  try {
    console.log("🔍 Fetching student profile by ID:", studentId);

    if (!studentId || studentId === 'undefined') {
      console.error("❌ Invalid studentId provided:", studentId);
      return null;
    }

    // Try to get by user_id first, then by id
    let { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", studentId)
      .single();

    if (!student) {
      const { data: studentById, error: idError } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();
      
      student = studentById;
      error = idError;
    }

    if (error || !student) {
      console.error("❌ Error fetching student profile:", error);
      return null;
    }

    await ensureStudentProfileExists(student);

    console.log("✅ Found student profile:", {
      id: student.id,
      user_id: student.user_id,
      username: student.username
    });
    
    return {
      id: student.id,
      user_id: student.user_id || student.id,
      username: student.username,
      display_name: student.display_name,
      coins: student.coins || 0,
      school_id: student.school_id,
      class_id: student.class_id,
      avatar_url: student.profile_photo
    };
  } catch (error) {
    console.error("❌ Error in getStudentProfileById:", error);
    return null;
  }
};

// Update student coins - now works with both students and student_profiles tables
export const updateStudentCoins = async (
  studentId: string,
  amount: number,
  reason?: string
): Promise<boolean> => {
  try {
    console.log("💰 Updating student coins:", { studentId, amount, reason });

    if (!studentId || studentId === 'undefined') {
      console.error("❌ Invalid studentId for coin update:", studentId);
      return false;
    }

    if (amount === 0) {
      console.log("⚠️ Zero amount coin update - skipping");
      return true;
    }

    // Get student by ID to find the correct user_id
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("id, user_id, coins")
      .or(`id.eq.${studentId},user_id.eq.${studentId}`)
      .single();

    if (fetchError || !student) {
      console.error("❌ Error fetching student for coin update:", fetchError);
      return false;
    }

    const userId = student.user_id || student.id;
    const currentCoins = student.coins || 0;
    const newBalance = Math.max(0, currentCoins + amount);

    console.log("💰 Coin update calculation:", {
      studentId: student.id,
      userId,
      currentCoins,
      changeAmount: amount,
      newBalance
    });

    // Update coins in students table
    const { error: updateStudentsError } = await supabase
      .from("students")
      .update({ coins: newBalance })
      .eq("id", student.id);

    if (updateStudentsError) {
      console.error("❌ Error updating coins in students table:", updateStudentsError);
      return false;
    }

    // Also update in student_profiles table
    const { error: updateProfilesError } = await supabase
      .from("student_profiles")
      .update({ coins: newBalance })
      .eq("user_id", userId);

    if (updateProfilesError) {
      console.warn("⚠️ Error updating coins in student_profiles table:", updateProfilesError);
      // Don't fail completely if student_profiles update fails
    }

    console.log(`✅ Updated student coins successfully: ${amount > 0 ? '+' : ''}${amount} (New balance: ${newBalance})`);
    return true;
    
  } catch (error) {
    console.error("❌ Unexpected error updating student coins:", error);
    return false;
  }
};

// Check daily attempt availability
export const checkDailyAttempt = async (studentId: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_attempts')
      .select('used')
      .eq('student_id', studentId)
      .eq('attempt_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error checking daily attempt:", error);
      return false;
    }

    return !data || !data.used;
  } catch (error) {
    console.error("Error checking daily attempt:", error);
    return false;
  }
};

export const useDailyAttempt = async (studentId: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('daily_attempts')
      .upsert({
        student_id: studentId,
        attempt_date: today,
        used: true
      });

    return !error;
  } catch (error) {
    console.error("Error using daily attempt:", error);
    return false;
  }
};

export const addMysteryBallHistory = async (
  studentId: string,
  resultType: string,
  pokemon?: any,
  coinsAmount?: number
): Promise<void> => {
  try {
    await supabase.from('mystery_ball_history').insert({
      student_id: studentId,
      result_type: resultType,
      pokemon_name: pokemon?.name,
      pokemon_id: pokemon?.id?.toString(),
      coins_amount: coinsAmount
    });
  } catch (error) {
    console.error("Error saving mystery ball history:", error);
  }
};

export const getMysteryBallHistory = async (studentId: string): Promise<MysteryBallHistoryRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('mystery_ball_history')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching mystery ball history:", error);
      return [];
    }

    return (data || []).map(record => ({
      ...record,
      type: record.result_type,
      pokemon_data: record.pokemon_name ? { name: record.pokemon_name, id: record.pokemon_id } : undefined
    }));
  } catch (error) {
    console.error("Error in getMysteryBallHistory:", error);
    return [];
  }
};

export const addPokemonToCollection = async (
  studentId: string,
  pokemonId: number,
  schoolId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source: 'manual_award'
      });

    if (error) {
      console.error("❌ Error adding Pokemon to collection:", error);
      return false;
    }

    console.log("✅ Pokemon added to collection successfully");
    return true;
  } catch (error) {
    console.error("❌ Error in addPokemonToCollection:", error);
    return false;
  }
};

export const getSchoolPokemonPool = async (schoolId: string) => {
  const { fetchSchoolPokemonPool } = await import("./schoolPokemonService");
  return fetchSchoolPokemonPool(schoolId);
};

export const assignPokemonFromSchoolPool = async (
  schoolId: string,
  studentId: string
) => {
  return assignPokemonFromPool(schoolId, studentId);
};
