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
  type: string; // Added for compatibility
  pokemon_name?: string;
  pokemon_id?: string;
  pokemon_data?: any; // Added for compatibility
  coins_amount?: number;
  created_at: string;
}

// Get or create student profile
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

    // First try to get existing student
    console.log("🔍 Checking for existing student profile...");
    let { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (student) {
      console.log("✅ Found existing student profile:", {
        id: student.id,
        username: student.username,
        coins: student.coins
      });
      return student;
    }

    if (error && error.code !== 'PGRST116') {
      console.error("❌ Error fetching student:", error);
      return null;
    }

    // Create new student if not found
    console.log("📝 Creating new student profile for user:", userId);
    
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const uniqueUsername = `student_${timestamp}_${randomSuffix}`;
    
    const newStudentData = {
      user_id: userId,
      username: uniqueUsername,
      display_name: `Student ${userId.slice(0, 8)}`,
      class_id: classId || null,
      school_id: schoolId || null,
      password_hash: 'temp_hash'
    };

    console.log("📝 Inserting new student with data:", newStudentData);

    const { data: created, error: createError } = await supabase
      .from("students")
      .insert(newStudentData)
      .select()
      .single();

    if (createError) {
      console.error("❌ Error creating student profile:", createError);
      return null;
    }

    console.log("✅ Created new student profile:", {
      id: created.id,
      username: created.username
    });
    return created;
    
  } catch (error) {
    console.error("❌ Unexpected error in getOrCreateStudentProfile:", error);
    return null;
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

    const { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (error) {
      console.error("❌ Error fetching student profile:", error);
      return null;
    }

    console.log("✅ Found student profile:", {
      id: student.id,
      username: student.username
    });
    return student;
  } catch (error) {
    console.error("❌ Error in getStudentProfileById:", error);
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
    console.log("💰 Updating student coins:", { studentId, amount, reason });

    if (!studentId || studentId === 'undefined') {
      console.error("❌ Invalid studentId for coin update:", studentId);
      return false;
    }

    if (amount === 0) {
      console.log("⚠️ Zero amount coin update - skipping");
      return true;
    }

    // Get current balance
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("coins")
      .eq("id", studentId)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching student for coin update:", fetchError);
      return false;
    }

    if (!student) {
      console.error("❌ Student not found for coin update:", studentId);
      return false;
    }

    const currentCoins = student.coins || 0;
    const newBalance = Math.max(0, currentCoins + amount);

    console.log("💰 Coin update calculation:", {
      currentCoins,
      changeAmount: amount,
      newBalance
    });

    const { error: updateError } = await supabase
      .from("students")
      .update({ coins: newBalance })
      .eq("id", studentId);

    if (updateError) {
      console.error("❌ Error updating coins:", updateError);
      return false;
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

// Get mystery ball history
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

    // Transform data to match expected interface
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

// Add Pokemon to collection
export const addPokemonToCollection = async (
  studentId: string,
  pokemonId: number,
  schoolId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        school_id: schoolId
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
