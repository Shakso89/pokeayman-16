
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

// Get or create student profile
export const getOrCreateStudentProfile = async (
  userId: string,
  classId?: string,
  schoolId?: string
): Promise<StudentProfile | null> => {
  try {
    // First try to get existing student
    let { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (student) {
      console.log("✅ Found existing student profile:", student.username);
      return student;
    }

    // Create new student if not found
    console.log("📝 Creating new student profile for user:", userId);
    
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const uniqueUsername = `student_${timestamp}_${randomSuffix}`;
    
    const { data: created, error: createError } = await supabase
      .from("students")
      .insert({
        user_id: userId,
        username: uniqueUsername,
        display_name: `Student ${userId.slice(0, 8)}`,
        class_id: classId || null,
        school_id: schoolId || null,
        password_hash: 'temp_hash',
        coins: 0
      })
      .select()
      .single();

    if (createError) {
      console.error("❌ Error creating student profile:", createError);
      return null;
    }

    console.log("✅ Created new student profile:", created.username);
    return created;
    
  } catch (error) {
    console.error("❌ Error in getOrCreateStudentProfile:", error);
    return null;
  }
};

// Update student coins
export const updateStudentCoins = async (
  studentId: string,
  amount: number,
  reason?: string
): Promise<boolean> => {
  try {
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("coins")
      .eq("id", studentId)
      .single();

    if (fetchError || !student) {
      console.error("❌ Student not found:", fetchError);
      return false;
    }

    const newBalance = Math.max(0, (student.coins || 0) + amount);

    const { error: updateError } = await supabase
      .from("students")
      .update({ coins: newBalance })
      .eq("id", studentId);

    if (updateError) {
      console.error("❌ Error updating coins:", updateError);
      return false;
    }

    console.log(`✅ Updated student coins: ${amount > 0 ? '+' : ''}${amount} (New balance: ${newBalance})`);
    return true;
    
  } catch (error) {
    console.error("❌ Error updating student coins:", error);
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

// Use daily attempt
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

// Add mystery ball history
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

// Get school Pokemon pool
export const getSchoolPokemonPool = async (schoolId: string) => {
  const { getSchoolAvailablePokemon } = await import("./schoolPokemonService");
  return getSchoolAvailablePokemon(schoolId);
};

// Assign Pokemon from school pool
export const assignPokemonFromSchoolPool = async (
  schoolId: string,
  studentId: string
) => {
  return assignPokemonFromPool(schoolId, studentId);
};
