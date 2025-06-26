
import { supabase } from "@/integrations/supabase/client";

export const createCoinTransactionLog = async (
  studentId: string,
  amount: number,
  reason: string,
  type: string
) => {
  try {
    console.log("📝 Logging coin transaction:", { studentId, amount, reason, type });

    const { data, error } = await supabase
      .from('coin_history')
      .insert({
        user_id: studentId,
        change_amount: amount,
        reason,
        related_entity_type: type,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("❌ Error logging coin transaction:", error);
      throw error;
    }

    console.log("✅ Coin transaction logged successfully");
    return data;
  } catch (error) {
    console.error("❌ Unexpected error logging coin transaction:", error);
    throw error;
  }
};
