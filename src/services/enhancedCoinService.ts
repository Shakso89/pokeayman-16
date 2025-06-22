
import { supabase } from "@/integrations/supabase/client";

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

    // Step 1: Get or create student profile in students table
    let { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!student) {
      console.log("📝 Creating new student profile for enhanced coins:", userId);
      
      // Generate a unique username
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const uniqueUsername = `student_${timestamp}_${randomSuffix}`;
      
      const { data: created, error: createError } = await supabase
        .from("students")
        .insert({
          user_id: userId,
          username: uniqueUsername,
          display_name: `Student ${userId.slice(0, 8)}`,
          class_id: classId || null,
          school_id: schoolId || null,
          password_hash: 'temp_hash', // Required field
          coins: 0
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Could not create student profile:", createError);
        return { success: false, error: `Could not create student profile: ${createError.message}` };
      }

      student = created;
      console.log("✅ Created student profile for enhanced coins:", student.id);
    }

    // Step 2: Update student's coin balance
    const currentCoins = student.coins || 0;
    const newBalance = currentCoins + amount;

    const { error: updateError } = await supabase
      .from("students")
      .update({
        coins: newBalance,
      })
      .eq("id", student.id);

    if (updateError) {
      console.error("❌ Failed to update coins:", updateError);
      return { success: false, error: `Failed to update coins: ${updateError.message}` };
    }

    // Step 3: Log the transaction in coin_history
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
