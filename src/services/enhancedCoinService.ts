
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

interface CoinOperationResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

export const awardCoinsToStudentEnhanced = async (
  studentId: string,
  amount: number,
  reason: string = "Teacher award",
  type: string = "teacher_award",
  classId?: string,
  schoolId?: string
): Promise<CoinOperationResult> => {
  console.log("🎁 Awarding coins with enhanced service:", {
    studentId,
    amount,
    reason,
    type,
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
      return { success: false, error: profileError.message };
    }

    if (!profileData) {
      // Fallback to students table if profile doesn't exist
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('coins, id')
        .eq('id', studentId)
        .maybeSingle();

      if (studentError) {
        console.error("❌ Error fetching student:", studentError);
        return { success: false, error: studentError.message };
      }

      if (!studentData) {
        console.error("❌ Student not found for ID:", studentId);
        return { success: false, error: "Student not found" };
      }

      const newCoinAmount = (studentData.coins || 0) + amount;

      // Update coins in students table
      const { error: updateError } = await supabase
        .from('students')
        .update({ coins: newCoinAmount })
        .eq('id', studentId);

      if (updateError) {
        console.error("❌ Error updating student coins:", updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, newBalance: newCoinAmount };
    }

    const newCoinAmount = (profileData.coins || 0) + amount;

    // Update coins in student_profiles
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ coins: newCoinAmount })
      .eq('user_id', studentId);

    if (updateError) {
      console.error("❌ Error updating student profile:", updateError);
      return { success: false, error: updateError.message };
    }

    console.log("💰 Enhanced coin award successful:", {
      studentId,
      amount,
      reason,
      type
    });

    // Record the transaction in coin history
    const { error: historyError } = await supabase
      .from('coin_history')
      .insert({
        user_id: studentId,
        change_amount: amount,
        reason: reason,
        related_entity_type: classId ? 'class' : schoolId ? 'school' : 'teacher',
        related_entity_id: classId || schoolId
      });

    if (historyError) {
      console.warn("⚠️ Warning: Could not record coin history:", historyError);
      // Don't fail the operation for history recording issues
    }

    return { success: true, newBalance: newCoinAmount };

  } catch (error: any) {
    console.error("❌ Error in enhanced coin award:", error);
    
    toast({
      title: "Error",
      description: "Failed to award coins. Please try again.",
      variant: "destructive"
    });

    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

export const removeCoinsFromStudentEnhanced = async (
  studentId: string,
  amount: number,
  reason: string = "Teacher removal",
  type: string = "teacher_removal",
  classId?: string,
  schoolId?: string
): Promise<CoinOperationResult> => {
  console.log("💸 Removing coins with enhanced service:", {
    studentId,
    amount,
    reason,
    type,
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
      return { success: false, error: profileError.message };
    }

    if (!profileData) {
      // Fallback to students table
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('coins, id')
        .eq('id', studentId)
        .maybeSingle();

      if (studentError) {
        console.error("❌ Error fetching student:", studentError);
        return { success: false, error: studentError.message };
      }

      if (!studentData) {
        console.error("❌ Student not found for ID:", studentId);
        return { success: false, error: "Student not found" };
      }

      const currentCoins = studentData.coins || 0;
      const newCoinAmount = Math.max(0, currentCoins - amount);

      // Update coins in students table
      const { error: updateError } = await supabase
        .from('students')
        .update({ coins: newCoinAmount })
        .eq('id', studentId);

      if (updateError) {
        console.error("❌ Error updating student coins:", updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, newBalance: newCoinAmount };
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
      return { success: false, error: updateError.message };
    }

    console.log("💰 Enhanced coin removal successful:", {
      studentId,
      amount: -amount,
      reason,
      type
    });

    // Record the transaction in coin history
    const { error: historyError } = await supabase
      .from('coin_history')
      .insert({
        user_id: studentId,
        change_amount: -amount,
        reason: reason,
        related_entity_type: classId ? 'class' : schoolId ? 'school' : 'teacher',
        related_entity_id: classId || schoolId
      });

    if (historyError) {
      console.warn("⚠️ Warning: Could not record coin history:", historyError);
      // Don't fail the operation for history recording issues
    }

    return { success: true, newBalance: newCoinAmount };

  } catch (error: any) {
    console.error("❌ Error in enhanced coin removal:", error);
    
    toast({
      title: "Error",
      description: "Failed to remove coins. Please try again.",
      variant: "destructive"
    });

    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

// Export alias for compatibility
export const deductCoinsFromStudentEnhanced = removeCoinsFromStudentEnhanced;

// Add missing export for getStudentCoinsEnhanced
export const getStudentCoinsEnhanced = async (studentId: string): Promise<number> => {
  try {
    // First try student_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('coins')
      .eq('user_id', studentId)
      .maybeSingle();

    if (profileError) {
      console.error("❌ Error fetching student profile coins:", profileError);
      return 0;
    }

    if (profileData) {
      return profileData.coins || 0;
    }

    // Fallback to students table
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('coins')
      .eq('id', studentId)
      .maybeSingle();

    if (studentError) {
      console.error("❌ Error fetching student coins:", studentError);
      return 0;
    }

    return studentData?.coins || 0;
  } catch (error) {
    console.error("❌ Unexpected error fetching student coins:", error);
    return 0;
  }
};
