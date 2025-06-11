
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CREDIT_COSTS } from '@/types/roles';

export interface CreditCheckResult {
  hasEnoughCredits: boolean;
  currentCredits: number;
  requiredCredits: number;
  isUnlimited: boolean;
}

// Check if user has enough credits for an action
export const checkCredits = async (userId: string, actionType: keyof typeof CREDIT_COSTS): Promise<CreditCheckResult> => {
  try {
    const { data: creditData, error } = await supabase
      .from('teacher_credits')
      .select('credits, unlimited_credits')
      .eq('teacher_id', userId)
      .single();

    if (error) {
      console.error('Error checking credits:', error);
      return {
        hasEnoughCredits: false,
        currentCredits: 0,
        requiredCredits: CREDIT_COSTS[actionType],
        isUnlimited: false
      };
    }

    const requiredCredits = CREDIT_COSTS[actionType];
    const currentCredits = creditData?.credits || 0;
    const isUnlimited = creditData?.unlimited_credits || false;
    
    return {
      hasEnoughCredits: isUnlimited || currentCredits >= requiredCredits,
      currentCredits,
      requiredCredits,
      isUnlimited
    };
  } catch (error) {
    console.error('Error in checkCredits:', error);
    return {
      hasEnoughCredits: false,
      currentCredits: 0,
      requiredCredits: CREDIT_COSTS[actionType],
      isUnlimited: false
    };
  }
};

// Use credits for an action
export const useCredits = async (userId: string, actionType: keyof typeof CREDIT_COSTS, multiplier: number = 1): Promise<boolean> => {
  try {
    const creditCheck = await checkCredits(userId, actionType);
    
    if (!creditCheck.hasEnoughCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${creditCheck.requiredCredits * multiplier} credits for this action. You have ${creditCheck.currentCredits} credits.`,
        variant: "destructive"
      });
      return false;
    }

    // If unlimited credits, don't deduct
    if (creditCheck.isUnlimited) {
      return true;
    }

    const creditsToDeduct = creditCheck.requiredCredits * multiplier;

    // Get current used_credits value first
    const { data: currentData } = await supabase
      .from('teacher_credits')
      .select('used_credits')
      .eq('teacher_id', userId)
      .single();

    const currentUsedCredits = currentData?.used_credits || 0;

    const { error } = await supabase
      .from('teacher_credits')
      .update({ 
        credits: creditCheck.currentCredits - creditsToDeduct,
        used_credits: currentUsedCredits + creditsToDeduct
      })
      .eq('teacher_id', userId);

    if (error) {
      console.error('Error deducting credits:', error);
      toast({
        title: "Error",
        description: "Failed to process credit transaction",
        variant: "destructive"
      });
      return false;
    }

    // Log the transaction
    await supabase
      .from('credit_transactions')
      .insert({
        teacher_id: userId,
        amount: -creditsToDeduct,
        reason: `${actionType} action`
      });

    return true;
  } catch (error) {
    console.error('Error in useCredits:', error);
    return false;
  }
};

// Get current user credits
export const getCurrentCredits = async (userId: string): Promise<{ credits: number; unlimited: boolean }> => {
  try {
    const { data, error } = await supabase
      .from('teacher_credits')
      .select('credits, unlimited_credits')
      .eq('teacher_id', userId)
      .single();

    if (error) {
      console.error('Error getting credits:', error);
      return { credits: 0, unlimited: false };
    }

    return {
      credits: data?.credits || 0,
      unlimited: data?.unlimited_credits || false
    };
  } catch (error) {
    console.error('Error in getCurrentCredits:', error);
    return { credits: 0, unlimited: false };
  }
};
