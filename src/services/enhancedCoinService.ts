
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

    // First, get current data from both tables to ensure consistency
    const { data: currentProfile, error: fetchProfileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    const { data: currentStudent, error: fetchStudentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    let currentCoins = 0;
    let profileExists = false;

    if (currentProfile) {
      currentCoins = currentProfile.coins || 0;
      profileExists = true;
    } else if (currentStudent) {
      currentCoins = currentStudent.coins || 0;
      // Create profile from student data
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: currentStudent.user_id,
          username: currentStudent.username,
          display_name: currentStudent.display_name || currentStudent.username,
          coins: currentStudent.coins || 0,
          spent_coins: 0,
          school_id: currentStudent.school_id,
          class_id: currentStudent.class_id,
          teacher_id: currentStudent.teacher_id,
          avatar_url: currentStudent.profile_photo,
          school_name: currentStudent.school_name
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Failed to create student profile:", createError);
        return { success: false, error: "Failed to create student profile" };
      }
      profileExists = true;
    } else {
      return { success: false, error: "Student not found" };
    }

    const newBalance = currentCoins + amount;

    // Update student_profiles (primary source of truth)
    const { data: updatedProfile, error: updateProfileError } = await supabase
      .from('student_profiles')
      .update({ 
        coins: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', studentId)
      .select()
      .single();

    if (updateProfileError) {
      console.error("❌ Error updating student profile:", updateProfileError);
      return { success: false, error: `Failed to update coins: ${updateProfileError.message}` };
    }

    // Also update the legacy students table for backward compatibility
    const { error: updateStudentError } = await supabase
      .from('students')
      .update({ coins: newBalance })
      .eq('user_id', studentId);

    if (updateStudentError) {
      console.warn("⚠️ Failed to update legacy students table:", updateStudentError);
    }

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
    
    // Try student_profiles first
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    if (profileData) {
      currentProfile = profileData;
    } else {
      // Fallback to students table
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', studentId)
        .maybeSingle();

      if (!studentData) {
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
    // Try student_profiles first
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', studentId)
      .maybeSingle();

    if (profile) {
      return {
        coins: profile.coins || 0,
        spentCoins: profile.spent_coins || 0
      };
    }

    // Fallback to students table
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('coins')
      .eq('user_id', studentId)
      .maybeSingle();

    if (student) {
      return {
        coins: student.coins || 0,
        spentCoins: 0
      };
    }

    console.error("❌ Error fetching coins - student not found");
    return { coins: 0, spentCoins: 0 };
  } catch (error) {
    console.error("❌ Unexpected error fetching coins:", error);
    return { coins: 0, spentCoins: 0 };
  }
};
