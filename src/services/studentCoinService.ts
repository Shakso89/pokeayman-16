
import { supabase } from "@/integrations/supabase/client";

export interface StudentCoinData {
  coins: number;
  spentCoins: number;
  totalEarned: number;
}

// Get student coin data from database
export const getStudentCoins = async (studentId: string): Promise<StudentCoinData> => {
  try {
    console.log("Fetching coins for student:", studentId);
    
    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', studentId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching student coins:", error);
      return { coins: 0, spentCoins: 0, totalEarned: 0 };
    }

    if (!profile) {
      console.log("No profile found for student:", studentId);
      return { coins: 0, spentCoins: 0, totalEarned: 0 };
    }

    const coins = profile.coins || 0;
    const spentCoins = profile.spent_coins || 0;
    const totalEarned = coins + spentCoins;

    console.log("Student coin data:", { coins, spentCoins, totalEarned });
    
    return {
      coins,
      spentCoins,
      totalEarned
    };
  } catch (error) {
    console.error("Error in getStudentCoins:", error);
    return { coins: 0, spentCoins: 0, totalEarned: 0 };
  }
};

// Update student coins in database
export const updateStudentCoins = async (
  studentId: string, 
  amount: number, 
  spentAmount: number = 0
): Promise<boolean> => {
  try {
    console.log(`Updating coins for student ${studentId}: amount=${amount}, spent=${spentAmount}`);
    
    // Get current values
    const { data: currentProfile } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', studentId)
      .single();

    const currentCoins = currentProfile?.coins || 0;
    const currentSpentCoins = currentProfile?.spent_coins || 0;

    // Calculate new values
    const newCoins = Math.max(0, currentCoins + amount);
    const newSpentCoins = currentSpentCoins + Math.max(0, spentAmount);

    const { error } = await supabase
      .from('student_profiles')
      .update({ 
        coins: newCoins,
        spent_coins: newSpentCoins
      })
      .eq('user_id', studentId);

    if (error) {
      console.error("Error updating student coins:", error);
      return false;
    }

    console.log(`Successfully updated coins for student ${studentId}`);
    return true;
  } catch (error) {
    console.error("Error in updateStudentCoins:", error);
    return false;
  }
};

// Award coins to student (positive amount)
export const awardCoins = async (studentId: string, amount: number): Promise<boolean> => {
  return await updateStudentCoins(studentId, amount, 0);
};

// Spend coins (negative amount for coins, positive for spent_coins tracking)
export const spendCoins = async (studentId: string, amount: number): Promise<boolean> => {
  return await updateStudentCoins(studentId, -amount, amount);
};

// Get student ranking data
export const getStudentRanking = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('user_id, username, display_name, coins, spent_coins, avatar_url')
      .order('coins', { ascending: false });

    if (error) {
      console.error("Error fetching student ranking:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getStudentRanking:", error);
    return [];
  }
};
