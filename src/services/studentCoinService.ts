
import { awardCoinsToStudentProfile, deductCoinsFromStudentProfile, createBasicStudentProfile } from "@/services/studentProfileManager";
import { supabase } from "@/integrations/supabase/client";

// Award coins to a student (creates profile if needed)
export const awardCoinsToStudent = async (studentId: string, amount: number): Promise<boolean> => {
  console.log(`Service: Awarding ${amount} coins to student ${studentId}`);
  return await awardCoinsToStudentProfile(studentId, amount);
};

// Deduct coins from student (for purchases, etc.)
export const deductCoinsFromStudent = async (studentId: string, amount: number): Promise<boolean> => {
  console.log(`Service: Deducting ${amount} coins from student ${studentId}`);
  return await deductCoinsFromStudentProfile(studentId, amount);
};

// Remove coins from student (alias for deductCoinsFromStudent for backwards compatibility)
export const removeCoinsFromStudent = async (studentId: string, amount: number): Promise<boolean> => {
  console.log(`Service: Removing ${amount} coins from student ${studentId}`);
  return await deductCoinsFromStudentProfile(studentId, amount);
};

// Get student's current coin balance
export const getStudentCoins = async (studentId: string): Promise<{ coins: number; spentCoins: number } | null> => {
  try {
    // Ensure profile exists
    const profileId = await createBasicStudentProfile(studentId);
    if (!profileId) {
      console.error("Could not get or create student profile for coin balance");
      return null;
    }

    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', studentId)
      .single();

    if (error) {
      console.error("Error fetching student coin balance:", error);
      return null;
    }

    return {
      coins: profile?.coins || 0,
      spentCoins: profile?.spent_coins || 0
    };
  } catch (error) {
    console.error("Error in getStudentCoins:", error);
    return null;
  }
};

// Check if student has enough coins for a purchase
export const hasEnoughCoins = async (studentId: string, requiredAmount: number): Promise<boolean> => {
  try {
    const coinData = await getStudentCoins(studentId);
    if (!coinData) return false;
    
    return coinData.coins >= requiredAmount;
  } catch (error) {
    console.error("Error checking coin balance:", error);
    return false;
  }
};
