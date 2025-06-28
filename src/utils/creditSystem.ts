
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreditOperationParams {
  studentId: string;
  amount: number;
  reason: string;
  teacherId?: string;
  classId?: string;
  schoolId?: string;
}

export const awardCoinsToStudent = async ({
  studentId,
  amount,
  reason,
  teacherId,
  classId,
  schoolId
}: CreditOperationParams) => {
  console.log("🎁 Awarding coins:", { studentId, amount, reason });

  try {
    // Update student_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('coins, user_id')
      .eq('user_id', studentId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profileData) {
      // Fallback to students table if profile doesn't exist
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('coins, id')
        .eq('id', studentId)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) throw new Error("Student not found");

      const newAmount = (studentData.coins || 0) + amount;
      const { error: updateError } = await supabase
        .from('students')
        .update({ coins: newAmount })
        .eq('id', studentId);

      if (updateError) throw updateError;
      
      return { success: true, newBalance: newAmount };
    }

    const newAmount = (profileData.coins || 0) + amount;
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ coins: newAmount })
      .eq('user_id', studentId);

    if (updateError) throw updateError;

    // Record transaction
    await supabase.from('coin_history').insert({
      user_id: studentId,
      change_amount: amount,
      reason: reason,
      related_entity_type: classId ? 'class' : schoolId ? 'school' : 'teacher',
      related_entity_id: classId || schoolId || teacherId
    });

    return { success: true, newBalance: newAmount };

  } catch (error: any) {
    console.error("❌ Error awarding coins:", error);
    toast({
      title: "Error",
      description: "Failed to award coins",
      variant: "destructive"
    });
    throw error;
  }
};

export const removeCoinsFromStudent = async ({
  studentId,
  amount,
  reason,
  teacherId,
  classId,
  schoolId
}: CreditOperationParams) => {
  console.log("💸 Removing coins:", { studentId, amount, reason });

  try {
    // Update student_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('coins, user_id')
      .eq('user_id', studentId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profileData) {
      // Fallback to students table
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('coins, id')
        .eq('id', studentId)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) throw new Error("Student not found");

      const newAmount = Math.max(0, (studentData.coins || 0) - amount);
      const { error: updateError } = await supabase
        .from('students')
        .update({ coins: newAmount })
        .eq('id', studentId);

      if (updateError) throw updateError;
      
      return { success: true, newBalance: newAmount };
    }

    const newAmount = Math.max(0, (profileData.coins || 0) - amount);
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ coins: newAmount })
      .eq('user_id', studentId);

    if (updateError) throw updateError;

    // Record transaction
    await supabase.from('coin_history').insert({
      user_id: studentId,
      change_amount: -amount,
      reason: reason,
      related_entity_type: classId ? 'class' : schoolId ? 'school' : 'teacher',
      related_entity_id: classId || schoolId || teacherId
    });

    return { success: true, newBalance: newAmount };

  } catch (error: any) {
    console.error("❌ Error removing coins:", error);
    toast({
      title: "Error",
      description: "Failed to remove coins",
      variant: "destructive"
    });
    throw error;
  }
};

export const getStudentPokemonCount = async (studentId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('student_pokemon_collection')
      .select('id')
      .eq('student_id', studentId);

    if (error) {
      console.error("❌ Error fetching Pokemon count:", error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error("❌ Error in getStudentPokemonCount:", error);
    return 0;
  }
};

// Add missing homework-related credit functions
export const checkAndConsumeCreditsForHomeworkPost = async (teacherId: string): Promise<boolean> => {
  try {
    console.log("🔍 Checking credits for homework post:", teacherId);
    
    // Check if teacher has credits
    const { data: credits, error } = await supabase
      .from('teacher_credits')
      .select('credits, unlimited_credits')
      .eq('teacher_id', teacherId)
      .maybeSingle();

    if (error) {
      console.error("❌ Error fetching teacher credits:", error);
      toast({
        title: "Error",
        description: "Failed to check credits",
        variant: "destructive"
      });
      return false;
    }

    // If unlimited credits, allow
    if (credits?.unlimited_credits) {
      console.log("✅ Teacher has unlimited credits");
      return true;
    }

    // Check if has enough credits (1 credit per homework post)
    if (!credits || credits.credits < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to post homework",
        variant: "destructive"
      });
      return false;
    }

    // Consume 1 credit
    const { error: updateError } = await supabase
      .from('teacher_credits')
      .update({ 
        credits: credits.credits - 1,
        used_credits: (credits.used_credits || 0) + 1
      })
      .eq('teacher_id', teacherId);

    if (updateError) {
      console.error("❌ Error consuming credits:", updateError);
      toast({
        title: "Error",
        description: "Failed to consume credits",
        variant: "destructive"
      });
      return false;
    }

    console.log("✅ Credit consumed for homework post");
    return true;

  } catch (error) {
    console.error("❌ Error in checkAndConsumeCreditsForHomeworkPost:", error);
    toast({
      title: "Error",
      description: "Credit check failed",
      variant: "destructive"
    });
    return false;
  }
};

export const checkAndConsumeCreditsForHomeworkApproval = async (
  teacherId: string, 
  coinReward: number
): Promise<boolean> => {
  try {
    console.log("🔍 Checking credits for homework approval:", { teacherId, coinReward });
    
    // Check if teacher has credits
    const { data: credits, error } = await supabase
      .from('teacher_credits')
      .select('credits, unlimited_credits')
      .eq('teacher_id', teacherId)
      .maybeSingle();

    if (error) {
      console.error("❌ Error fetching teacher credits:", error);
      toast({
        title: "Error",
        description: "Failed to check credits",
        variant: "destructive"
      });
      return false;
    }

    // If unlimited credits, allow
    if (credits?.unlimited_credits) {
      console.log("✅ Teacher has unlimited credits");
      return true;
    }

    // Calculate required credits (1 credit per coin awarded)
    const requiredCredits = Math.max(1, Math.ceil(coinReward / 10)); // 1 credit per 10 coins

    // Check if has enough credits
    if (!credits || credits.credits < requiredCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need at least ${requiredCredits} credits to approve this homework`,
        variant: "destructive"
      });
      return false;
    }

    // Consume credits
    const { error: updateError } = await supabase
      .from('teacher_credits')
      .update({ 
        credits: credits.credits - requiredCredits,
        used_credits: (credits.used_credits || 0) + requiredCredits
      })
      .eq('teacher_id', teacherId);

    if (updateError) {
      console.error("❌ Error consuming credits:", updateError);
      toast({
        title: "Error",
        description: "Failed to consume credits",
        variant: "destructive"
      });
      return false;
    }

    console.log("✅ Credits consumed for homework approval");
    return true;

  } catch (error) {
    console.error("❌ Error in checkAndConsumeCreditsForHomeworkApproval:", error);
    toast({
      title: "Error",
      description: "Credit check failed",
      variant: "destructive"
    });
    return false;
  }
};
