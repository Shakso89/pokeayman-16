
import { supabase } from "@/integrations/supabase/client";
import { createCoinTransactionLog } from "@/services/coinTransactionService";

export interface CoinAwardResult {
  success: boolean;
  error?: string;
  newBalance?: number;
  transaction?: any;
}

// Enhanced coin service that ensures database synchronization
export const awardCoinsToStudentEnhanced = async (
  studentId: string,
  amount: number,
  reason: string = "Teacher award",
  type: string = "teacher_award",
  classId?: string,
  schoolId?: string
): Promise<CoinAwardResult> => {
  try {
    console.log("💰 Enhanced coin award:", { studentId, amount, reason, type });

    if (!studentId || studentId === 'undefined') {
      return { success: false, error: "Invalid student ID" };
    }

    if (amount <= 0) {
      return { success: false, error: "Amount must be positive" };
    }

    // First, ensure the student profile exists and get current data
    const { data: currentProfile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching student profile:", fetchError);
      return { success: false, error: "Student profile not found" };
    }

    const currentCoins = currentProfile.coins || 0;
    const newBalance = currentCoins + amount;

    // Update coins in student_profiles (primary source of truth)
    const { data: updatedProfile, error: updateError } = await supabase
      .from('student_profiles')
      .update({ 
        coins: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', studentId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating student profile:", updateError);
      return { success: false, error: "Failed to update coins" };
    }

    // Also update the legacy students table for backward compatibility
    await supabase
      .from('students')
      .update({ coins: newBalance })
      .eq('user_id', studentId);

    // Log the transaction
    try {
      await createCoinTransactionLog(studentId, amount, reason, type);
    } catch (logError) {
      console.warn("⚠️ Failed to log transaction:", logError);
    }

    console.log("✅ Coins awarded successfully:", { 
      studentId, 
      amount, 
      oldBalance: currentCoins, 
      newBalance 
    });

    return { 
      success: true, 
      newBalance,
      transaction: updatedProfile
    };

  } catch (error) {
    console.error("❌ Unexpected error in enhanced coin award:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

// Enhanced coin deduction with database sync
export const deductCoinsFromStudentEnhanced = async (
  studentId: string,
  amount: number,
  reason: string = "Purchase",
  type: string = "shop_purchase"
): Promise<CoinAwardResult> => {
  try {
    console.log("💸 Enhanced coin deduction:", { studentId, amount, reason, type });

    if (!studentId || studentId === 'undefined') {
      return { success: false, error: "Invalid student ID" };
    }

    if (amount <= 0) {
      return { success: false, error: "Amount must be positive" };
    }

    // Get current profile
    const { data: currentProfile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching student profile:", fetchError);
      return { success: false, error: "Student profile not found" };
    }

    const currentCoins = currentProfile.coins || 0;
    
    if (currentCoins < amount) {
      return { success: false, error: "Insufficient coins" };
    }

    const newBalance = currentCoins - amount;
    const newSpentCoins = (currentProfile.spent_coins || 0) + amount;

    // Update both coins and spent_coins in student_profiles
    const { data: updatedProfile, error: updateError } = await supabase
      .from('student_profiles')
      .update({ 
        coins: newBalance,
        spent_coins: newSpentCoins,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', studentId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating student profile:", updateError);
      return { success: false, error: "Failed to deduct coins" };
    }

    // Also update the legacy students table
    await supabase
      .from('students')
      .update({ coins: newBalance })
      .eq('user_id', studentId);

    // Log the transaction (negative amount for deduction)
    try {
      await createCoinTransactionLog(studentId, -amount, reason, type);
    } catch (logError) {
      console.warn("⚠️ Failed to log transaction:", logError);
    }

    console.log("✅ Coins deducted successfully:", { 
      studentId, 
      amount, 
      oldBalance: currentCoins, 
      newBalance 
    });

    return { 
      success: true, 
      newBalance,
      transaction: updatedProfile
    };

  } catch (error) {
    console.error("❌ Unexpected error in enhanced coin deduction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

// Get current coin balance from unified source
export const getStudentCoinsEnhanced = async (studentId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', studentId)
      .single();

    if (error) {
      console.error("❌ Error fetching coins:", error);
      return { coins: 0, spentCoins: 0 };
    }

    return {
      coins: profile.coins || 0,
      spentCoins: profile.spent_coins || 0
    };
  } catch (error) {
    console.error("❌ Unexpected error fetching coins:", error);
    return { coins: 0, spentCoins: 0 };
  }
};
