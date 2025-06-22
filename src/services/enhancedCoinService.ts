
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateStudentProfile, updateStudentCoins } from "./studentDatabase";

export const awardCoinsToStudentEnhanced = async (
  userId: string,
  amount: number,
  reason: string = "Teacher award",
  type: string = "teacher_award",
  classId?: string,
  schoolId?: string
): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
  try {
    console.log("🪙 Enhanced coin awarding started", { 
      userId, 
      amount, 
      reason, 
      type, 
      classId, 
      schoolId 
    });

    // Validate inputs
    if (!userId || userId === 'undefined') {
      const error = "Invalid or missing user ID";
      console.error("❌ Validation error:", error);
      return { success: false, error };
    }

    if (!amount || amount <= 0) {
      const error = "Invalid amount - must be positive number";
      console.error("❌ Validation error:", error);
      return { success: false, error };
    }

    // Get or create student profile using the corrected function
    console.log("🔍 Getting or creating student profile...");
    const student = await getOrCreateStudentProfile(userId, classId, schoolId);
    if (!student) {
      const error = "Could not create or find student profile";
      console.error("❌ Student profile error:", error);
      return { success: false, error };
    }

    console.log("✅ Student profile found/created:", {
      studentId: student.id,
      userId: student.user_id,
      username: student.username,
      currentCoins: student.coins
    });

    // Update student's coin balance using the student ID
    console.log("💰 Updating student coins...");
    const success = await updateStudentCoins(student.id, amount, reason);
    if (!success) {
      const error = "Failed to update coins in database";
      console.error("❌ Coin update failed");
      return { success: false, error };
    }

    // Get new balance from students table
    console.log("🔍 Fetching updated balance...");
    const { data: updatedStudent, error: balanceError } = await supabase
      .from("students")
      .select("coins")
      .eq("id", student.id)
      .single();

    if (balanceError) {
      console.error("⚠️ Warning: Could not fetch updated balance:", balanceError);
    }

    const newBalance = updatedStudent?.coins || (student.coins || 0) + amount;

    // Log the transaction using the correct user_id
    try {
      console.log("📝 Logging coin transaction...");
      await supabase.from("coin_history").insert({
        user_id: student.user_id,
        change_amount: amount,
        reason: reason,
        related_entity_type: type,
        related_entity_id: classId
      });
      console.log("✅ Transaction logged successfully");
    } catch (logError) {
      console.warn("⚠️ Failed to log coin transaction:", logError);
    }

    console.log(`✅ Enhanced coin awarding completed successfully. Awarded ${amount} coins. New balance: ${newBalance}`);
    return { success: true, newBalance };

  } catch (error) {
    console.error("❌ Error in enhanced coin awarding:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { 
      success: false, 
      error: `Coin awarding failed: ${errorMessage}` 
    };
  }
};
