
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CoinAwardParams {
  studentId: string;
  amount: number;
  reason: string;
  teacherId?: string;
  classId?: string;
  schoolId?: string;
}

export const awardCoinsToStudentEnhanced = async ({
  studentId,
  amount,
  reason,
  teacherId,
  classId,
  schoolId
}: CoinAwardParams) => {
  console.log("🎁 Awarding coins with enhanced service:", {
    studentId,
    amount,
    reason,
    teacherId,
    classId,
    schoolId
  });

  try {
    // First, update the student_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('coins, user_id')
      .eq('user_id', studentId)
      .maybeSingle();

    if (profileError) {
      console.error("❌ Error fetching student profile:", profileError);
      throw profileError;
    }

    if (!profileData) {
      console.error("❌ Student profile not found for ID:", studentId);
      throw new Error("Student profile not found");
    }

    const newCoinAmount = (profileData.coins || 0) + amount;

    // Update coins in student_profiles
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ coins: newCoinAmount })
      .eq('user_id', studentId);

    if (updateError) {
      console.error("❌ Error updating student profile:", updateError);
      throw updateError;
    }

    console.log("💰 Enhanced coin award:", {
      studentId,
      amount,
      reason,
      type: "teacher_award"
    });

    // Record the transaction in coin history
    const { error: historyError } = await supabase
      .from('coin_history')
      .insert({
        user_id: studentId,
        change_amount: amount,
        reason: reason,
        related_entity_type: classId ? 'class' : schoolId ? 'school' : 'teacher',
        related_entity_id: classId || schoolId || teacherId
      });

    if (historyError) {
      console.warn("⚠️ Warning: Could not record coin history:", historyError);
      // Don't throw here, as the main operation succeeded
    }

    return { success: true, newBalance: newCoinAmount };

  } catch (error: any) {
    console.error("❌ Error in enhanced coin award:", error);
    
    toast({
      title: "Error",
      description: "Failed to award coins. Please try again.",
      variant: "destructive"
    });

    throw error;
  }
};

export const removeCoinsFromStudentEnhanced = async ({
  studentId,
  amount,
  reason,
  teacherId,
  classId,
  schoolId
}: CoinAwardParams) => {
  console.log("💸 Removing coins with enhanced service:", {
    studentId,
    amount,
    reason,
    teacherId,
    classId,
    schoolId
  });

  try {
    // First, get current coins from student_profiles
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('coins, user_id')
      .eq('user_id', studentId)
      .maybeSingle();

    if (profileError) {
      console.error("❌ Error fetching student profile:", profileError);
      throw profileError;
    }

    if (!profileData) {
      console.error("❌ Student profile not found for ID:", studentId);
      throw new Error("Student profile not found");
    }

    const currentCoins = profileData.coins || 0;
    const newCoinAmount = Math.max(0, currentCoins - amount);

    // Update coins in student_profiles
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ coins: newCoinAmount })
      .eq('user_id', studentId);

    if (updateError) {
      console.error("❌ Error updating student profile:", updateError);
      throw updateError;
    }

    console.log("💰 Enhanced coin removal:", {
      studentId,
      amount: -amount,
      reason,
      type: "teacher_removal"
    });

    // Record the transaction in coin history
    const { error: historyError } = await supabase
      .from('coin_history')
      .insert({
        user_id: studentId,
        change_amount: -amount,
        reason: reason,
        related_entity_type: classId ? 'class' : schoolId ? 'school' : 'teacher',
        related_entity_id: classId || schoolId || teacherId
      });

    if (historyError) {
      console.warn("⚠️ Warning: Could not record coin history:", historyError);
      // Don't throw here, as the main operation succeeded
    }

    return { success: true, newBalance: newCoinAmount };

  } catch (error: any) {
    console.error("❌ Error in enhanced coin removal:", error);
    
    toast({
      title: "Error",
      description: "Failed to remove coins. Please try again.",
      variant: "destructive"
    });

    throw error;
  }
};
