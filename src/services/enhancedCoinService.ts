
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
    console.log("🪙 Enhanced coin awarding", { userId, amount, reason, type, classId, schoolId });

    // Get or create student profile
    const student = await getOrCreateStudentProfile(userId, classId, schoolId);
    if (!student) {
      return { success: false, error: "Could not create or find student profile" };
    }

    // Update student's coin balance
    const success = await updateStudentCoins(student.id, amount, reason);
    if (!success) {
      return { success: false, error: "Failed to update coins" };
    }

    // Get new balance
    const { data: updatedStudent } = await supabase
      .from("students")
      .select("coins")
      .eq("id", student.id)
      .single();

    const newBalance = updatedStudent?.coins || 0;

    // Log the transaction
    try {
      await supabase.from("coin_history").insert({
        user_id: student.user_id,
        change_amount: amount,
        reason: reason,
        related_entity_type: type,
        related_entity_id: classId
      });
    } catch (logError) {
      console.warn("Failed to log coin transaction:", logError);
    }

    console.log(`✅ Enhanced: Awarded ${amount} coins. New balance: ${newBalance}`);
    return { success: true, newBalance };

  } catch (error) {
    console.error("❌ Error in enhanced coin awarding:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};
