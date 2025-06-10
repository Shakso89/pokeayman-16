
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TeacherCredits {
  teacher_id: string;
  credits: number;
  unlimited_credits: boolean;
}

export const getTeacherCredits = async (teacherId: string): Promise<TeacherCredits | null> => {
  try {
    const { data, error } = await supabase
      .from('teacher_credits')
      .select('*')
      .eq('teacher_id', teacherId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching teacher credits:', error);
      return null;
    }

    return data || { teacher_id: teacherId, credits: 0, unlimited_credits: false };
  } catch (error) {
    console.error('Error fetching teacher credits:', error);
    return null;
  }
};

export const checkAndConsumeCredits = async (teacherId: string, amount: number, reason: string): Promise<boolean> => {
  try {
    const credits = await getTeacherCredits(teacherId);
    
    if (!credits) {
      toast({
        title: "Error",
        description: "Could not fetch credit information",
        variant: "destructive"
      });
      return false;
    }

    // Check if user has unlimited credits
    if (credits.unlimited_credits) {
      console.log("User has unlimited credits, allowing action");
      return true;
    }

    // Check if user has enough credits
    if (credits.credits < amount) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${amount} credits for this action. You have ${credits.credits} credits.`,
        variant: "destructive"
      });
      return false;
    }

    // Consume credits
    const { error } = await supabase
      .from('teacher_credits')
      .update({ 
        credits: credits.credits - amount,
        used_credits: (credits.used_credits || 0) + amount
      })
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Error consuming credits:', error);
      toast({
        title: "Error",
        description: "Failed to consume credits",
        variant: "destructive"
      });
      return false;
    }

    // Log the transaction
    await supabase
      .from('credit_transactions')
      .insert({
        teacher_id: teacherId,
        amount: -amount,
        reason: reason
      });

    console.log(`Consumed ${amount} credits for: ${reason}`);
    return true;
  } catch (error) {
    console.error('Error checking/consuming credits:', error);
    toast({
      title: "Error",
      description: "Failed to process credits",
      variant: "destructive"
    });
    return false;
  }
};

export const hasUnlimitedCredits = async (teacherId: string): Promise<boolean> => {
  try {
    const credits = await getTeacherCredits(teacherId);
    return credits?.unlimited_credits || false;
  } catch (error) {
    console.error('Error checking unlimited credits:', error);
    return false;
  }
};
