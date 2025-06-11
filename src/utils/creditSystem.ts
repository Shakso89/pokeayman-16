
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CreditCosts {
  HOMEWORK_POST: 5;
  HOMEWORK_APPROVE: (coins: number) => number; // equals to coin reward
  DELETE_POKEMON: 3;
  AWARD_POKEMON: 5;
}

export const CREDIT_COSTS = {
  HOMEWORK_POST: 5,
  HOMEWORK_APPROVE: (coins: number) => coins, // equals to coin reward
  DELETE_POKEMON: 3,
  AWARD_POKEMON: 5,
} as const;

// Get teacher's current credits
export const getTeacherCredits = async (teacherId: string): Promise<{ credits: number; unlimited: boolean }> => {
  try {
    const { data, error } = await supabase
      .from('teacher_credits')
      .select('credits, unlimited_credits')
      .eq('teacher_id', teacherId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching teacher credits:', error);
      return { credits: 0, unlimited: false };
    }

    return {
      credits: data?.credits || 0,
      unlimited: data?.unlimited_credits || false
    };
  } catch (error) {
    console.error('Error in getTeacherCredits:', error);
    return { credits: 0, unlimited: false };
  }
};

// Check if teacher has enough credits for an action
export const hasEnoughCredits = async (teacherId: string, requiredCredits: number): Promise<boolean> => {
  const { credits, unlimited } = await getTeacherCredits(teacherId);
  
  if (unlimited) return true;
  return credits >= requiredCredits;
};

// Consume credits for an action
export const consumeCredits = async (
  teacherId: string, 
  creditsToConsume: number, 
  reason: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { credits, unlimited } = await getTeacherCredits(teacherId);
    
    // If unlimited credits, just log the transaction but don't deduct
    if (unlimited) {
      await logCreditTransaction(teacherId, -creditsToConsume, `${reason} (unlimited account)`);
      return { success: true, message: 'Action completed (unlimited credits)' };
    }
    
    // Check if enough credits
    if (credits < creditsToConsume) {
      return { 
        success: false, 
        message: `Insufficient credits. Required: ${creditsToConsume}, Available: ${credits}` 
      };
    }
    
    // Deduct credits - using RPC call instead of direct SQL
    const { error: updateError } = await supabase.rpc('consume_teacher_credits', {
      teacher_id: teacherId,
      credits_to_consume: creditsToConsume
    });
    
    if (updateError) {
      console.error('Error updating credits:', updateError);
      // Fallback to direct update if RPC doesn't exist
      const { error: fallbackError } = await supabase
        .from('teacher_credits')
        .update({ 
          credits: credits - creditsToConsume,
          used_credits: (await getUsedCredits(teacherId)) + creditsToConsume
        })
        .eq('teacher_id', teacherId);
      
      if (fallbackError) {
        console.error('Error with fallback update:', fallbackError);
        return { success: false, message: 'Failed to process credits' };
      }
    }
    
    // Log the transaction
    await logCreditTransaction(teacherId, -creditsToConsume, reason);
    
    return { 
      success: true, 
      message: `${creditsToConsume} credits consumed. Remaining: ${credits - creditsToConsume}` 
    };
  } catch (error) {
    console.error('Error in consumeCredits:', error);
    return { success: false, message: 'Failed to process credits' };
  }
};

// Helper function to get used credits
const getUsedCredits = async (teacherId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('teacher_credits')
      .select('used_credits')
      .eq('teacher_id', teacherId)
      .single();

    if (error) return 0;
    return data?.used_credits || 0;
  } catch (error) {
    return 0;
  }
};

// Log credit transaction
export const logCreditTransaction = async (
  teacherId: string, 
  amount: number, 
  reason: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('credit_transactions')
      .insert({
        teacher_id: teacherId,
        amount,
        reason
      });
    
    if (error) {
      console.error('Error logging credit transaction:', error);
    }
  } catch (error) {
    console.error('Error in logCreditTransaction:', error);
  }
};

// Wrapper functions for specific actions
export const checkAndConsumeCreditsForHomeworkPost = async (teacherId: string): Promise<boolean> => {
  const result = await consumeCredits(teacherId, CREDIT_COSTS.HOMEWORK_POST, 'Homework posting');
  
  if (!result.success) {
    toast({
      title: "Insufficient Credits",
      description: `You need ${CREDIT_COSTS.HOMEWORK_POST} credits to post homework. ${result.message}`,
      variant: "destructive"
    });
    return false;
  }
  
  return true;
};

export const checkAndConsumeCreditsForHomeworkApproval = async (
  teacherId: string, 
  coinReward: number
): Promise<boolean> => {
  const requiredCredits = CREDIT_COSTS.HOMEWORK_APPROVE(coinReward);
  const result = await consumeCredits(
    teacherId, 
    requiredCredits, 
    `Homework approval (${coinReward} coin reward)`
  );
  
  if (!result.success) {
    toast({
      title: "Insufficient Credits",
      description: `You need ${requiredCredits} credits to approve this homework. ${result.message}`,
      variant: "destructive"
    });
    return false;
  }
  
  return true;
};

export const checkAndConsumeCreditsForPokemonDeletion = async (teacherId: string): Promise<boolean> => {
  const result = await consumeCredits(teacherId, CREDIT_COSTS.DELETE_POKEMON, 'Pokemon deletion');
  
  if (!result.success) {
    toast({
      title: "Insufficient Credits",
      description: `You need ${CREDIT_COSTS.DELETE_POKEMON} credits to delete Pokemon. ${result.message}`,
      variant: "destructive"
    });
    return false;
  }
  
  return true;
};

export const checkAndConsumeCreditsForPokemonAward = async (teacherId: string): Promise<boolean> => {
  const result = await consumeCredits(teacherId, CREDIT_COSTS.AWARD_POKEMON, 'Pokemon award');
  
  if (!result.success) {
    toast({
      title: "Insufficient Credits",
      description: `You need ${CREDIT_COSTS.AWARD_POKEMON} credits to award Pokemon. ${result.message}`,
      variant: "destructive"
    });
    return false;
  }
  
  return true;
};
