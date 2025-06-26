
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

// Enhanced coin deduction with database sync and proper validation
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

    // Get current profile with retry logic
    let currentProfile;
    let fetchError;
    
    // Try student_profiles first
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .single();

    if (profileError) {
      console.warn("⚠️ Student profile not found, trying students table:", profileError);
      
      // Fallback to students table
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', studentId)
        .single();

      if (studentError) {
        console.error("❌ Student not found in either table:", studentError);
        return { success: false, error: "Student not found" };
      }

      // Create/sync profile from student data
      const { data: syncedProfile, error: syncError } = await supabase
        .from('student_profiles')
        .upsert({
          user_id: studentData.user_id,
          username: studentData.username,
          display_name: studentData.display_name || studentData.username,
          coins: studentData.coins || 0,
          spent_coins: 0,
          school_id: studentData.school_id,
          class_id: studentData.class_id,
          teacher_id: studentData.teacher_id,
          avatar_url: studentData.profile_photo,
          school_name: studentData.school_name
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (syncError) {
        console.error("❌ Failed to sync student profile:", syncError);
        return { success: false, error: "Failed to sync student data" };
      }

      currentProfile = syncedProfile;
    } else {
      currentProfile = profileData;
    }

    const currentCoins = currentProfile.coins || 0;
    
    console.log("💰 Current coins before deduction:", currentCoins);
    
    if (currentCoins < amount) {
      return { 
        success: false, 
        error: `Insufficient coins. Required: ${amount}, Available: ${currentCoins}` 
      };
    }

    const newBalance = currentCoins - amount;
    const newSpentCoins = (currentProfile.spent_coins || 0) + amount;

    console.log("💰 Attempting to deduct coins:", { currentCoins, amount, newBalance });

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
      return { success: false, error: `Failed to deduct coins: ${updateError.message}` };
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
