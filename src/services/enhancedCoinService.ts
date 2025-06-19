
import { supabase } from "@/integrations/supabase/client";
import { debugService } from "./debugService";
import { createBasicStudentProfile } from "./studentProfileManager";
import { addCoinHistoryEntry } from "./coinHistoryService";

export interface CoinAwardResult {
  success: boolean;
  error?: string;
  newBalance?: number;
  profileCreated?: boolean;
}

// Enhanced coin awarding with comprehensive error handling and debugging
export const awardCoinsToStudentEnhanced = async (
  studentId: string,
  amount: number,
  reason: string = "Manual award",
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<CoinAwardResult> => {
  debugService.log("Starting coin award process", { studentId, amount, reason });

  try {
    // Step 1: Validate inputs
    if (!debugService.validateStudentId(studentId)) {
      return { success: false, error: "Invalid student ID" };
    }

    if (!debugService.validateAmount(amount)) {
      return { success: false, error: "Invalid amount" };
    }

    // Step 2: Check if student exists in students table
    debugService.log("Checking if student exists", { studentId });
    const { data: studentExists, error: studentCheckError } = await supabase
      .from('students')
      .select('id, username, display_name')
      .eq('id', studentId)
      .maybeSingle();

    if (studentCheckError) {
      debugService.logError("Student existence check failed", studentCheckError, { studentId });
      return { success: false, error: "Failed to verify student existence" };
    }

    if (!studentExists) {
      debugService.logError("Student not found in students table", null, { studentId });
      return { success: false, error: "Student not found" };
    }

    debugService.log("Student found", studentExists);

    // Step 3: Ensure student profile exists
    debugService.log("Ensuring student profile exists", { studentId });
    const profileId = await createBasicStudentProfile(studentId);
    
    if (!profileId) {
      debugService.logError("Failed to create/ensure student profile", null, { studentId });
      return { success: false, error: "Failed to create student profile" };
    }

    debugService.log("Student profile ensured", { profileId });

    // Step 4: Get current coins
    debugService.log("Fetching current coins", { studentId });
    const { data: currentProfile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('coins, username, display_name')
      .eq('user_id', studentId)
      .single();

    if (fetchError) {
      debugService.logError("Failed to fetch current coins", fetchError, { studentId });
      return { success: false, error: "Failed to fetch current coins" };
    }

    const currentCoins = currentProfile?.coins || 0;
    const newCoins = currentCoins + amount;

    debugService.log("Current coin balance", { currentCoins, amount, newCoins });

    // Step 5: Update coins
    debugService.log("Updating coins in database", { studentId, newCoins });
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ coins: newCoins })
      .eq('user_id', studentId);

    if (updateError) {
      debugService.logError("Failed to update coins", updateError, { studentId, newCoins });
      return { success: false, error: "Failed to update coins" };
    }

    debugService.log("Coins updated successfully", { studentId, newCoins });

    // Step 6: Add coin history entry
    debugService.log("Adding coin history entry", { studentId, amount, reason });
    const historySuccess = await addCoinHistoryEntry(
      studentId,
      amount,
      reason,
      relatedEntityType,
      relatedEntityId
    );

    if (!historySuccess) {
      debugService.logError("Failed to add coin history", null, { studentId, amount, reason });
      // Don't fail the entire operation for history logging failure
    }

    debugService.log("Coin award completed successfully", { 
      studentId, 
      amount, 
      newBalance: newCoins 
    });

    return {
      success: true,
      newBalance: newCoins,
      profileCreated: false
    };

  } catch (error) {
    debugService.logError("Unexpected error in coin award process", error, { studentId, amount, reason });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Enhanced coin deduction with debugging
export const deductCoinsFromStudentEnhanced = async (
  studentId: string,
  amount: number,
  reason: string = "Manual deduction"
): Promise<CoinAwardResult> => {
  debugService.log("Starting coin deduction process", { studentId, amount, reason });

  try {
    // Validate inputs
    if (!debugService.validateStudentId(studentId)) {
      return { success: false, error: "Invalid student ID" };
    }

    if (!debugService.validateAmount(amount)) {
      return { success: false, error: "Invalid amount" };
    }

    // Get current coins
    const { data: profile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', studentId)
      .single();

    if (fetchError) {
      debugService.logError("Failed to fetch profile for deduction", fetchError, { studentId });
      return { success: false, error: "Failed to fetch student profile" };
    }

    const currentCoins = profile?.coins || 0;
    const currentSpentCoins = profile?.spent_coins || 0;

    if (currentCoins < amount) {
      debugService.logError("Insufficient coins for deduction", null, { 
        studentId, 
        currentCoins, 
        requestedAmount: amount 
      });
      return { success: false, error: "Insufficient coins" };
    }

    const newCoins = currentCoins - amount;
    const newSpentCoins = currentSpentCoins + amount;

    // Update coins
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ 
        coins: newCoins,
        spent_coins: newSpentCoins
      })
      .eq('user_id', studentId);

    if (updateError) {
      debugService.logError("Failed to deduct coins", updateError, { studentId, newCoins });
      return { success: false, error: "Failed to deduct coins" };
    }

    // Add negative history entry
    await addCoinHistoryEntry(studentId, -amount, reason);

    debugService.log("Coin deduction completed successfully", { 
      studentId, 
      amount, 
      newBalance: newCoins 
    });

    return {
      success: true,
      newBalance: newCoins
    };

  } catch (error) {
    debugService.logError("Unexpected error in coin deduction process", error, { studentId, amount, reason });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Get student coin balance with validation
export const getStudentCoinBalance = async (studentId: string): Promise<{ balance: number; error?: string }> => {
  try {
    if (!debugService.validateStudentId(studentId)) {
      return { balance: 0, error: "Invalid student ID" };
    }

    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('coins')
      .eq('user_id', studentId)
      .single();

    if (error) {
      debugService.logError("Failed to fetch coin balance", error, { studentId });
      return { balance: 0, error: "Failed to fetch balance" };
    }

    const balance = profile?.coins || 0;
    debugService.log("Fetched coin balance", { studentId, balance });
    return { balance };

  } catch (error) {
    debugService.logError("Unexpected error fetching coin balance", error, { studentId });
    return { balance: 0, error: "Unknown error occurred" };
  }
};
