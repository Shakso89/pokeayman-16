
import { supabase } from "@/integrations/supabase/client";
import { CoinHistoryEntry } from "@/types/user";

// Add coin history entry
export const addCoinHistoryEntry = async (
  userId: string,
  changeAmount: number,
  reason: string,
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('coin_history')
      .insert({
        user_id: userId,
        change_amount: changeAmount,
        reason: reason,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId
      });

    if (error) {
      console.error('Error adding coin history entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding coin history entry:', error);
    return false;
  }
};

// Get user's coin history
export const getUserCoinHistory = async (userId: string): Promise<CoinHistoryEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('coin_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coin history:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      changeAmount: item.change_amount,
      reason: item.reason,
      relatedEntityType: item.related_entity_type,
      relatedEntityId: item.related_entity_id,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error('Error fetching coin history:', error);
    return [];
  }
};

// Award coins with history tracking
export const awardCoinsWithHistory = async (
  userId: string,
  amount: number,
  reason: string,
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<boolean> => {
  try {
    // Update student profile coins
    const { data: profile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('coins')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching current coins:', fetchError);
      return false;
    }

    const currentCoins = profile?.coins || 0;
    const newCoins = currentCoins + amount;

    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ coins: newCoins })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating coins:', updateError);
      return false;
    }

    // Add history entry
    await addCoinHistoryEntry(userId, amount, reason, relatedEntityType, relatedEntityId);

    return true;
  } catch (error) {
    console.error('Error awarding coins with history:', error);
    return false;
  }
};

// Deduct coins with history tracking
export const deductCoinsWithHistory = async (
  userId: string,
  amount: number,
  reason: string,
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<boolean> => {
  try {
    // Get current coins
    const { data: profile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching current coins:', fetchError);
      return false;
    }

    const currentCoins = profile?.coins || 0;
    const currentSpentCoins = profile?.spent_coins || 0;
    
    if (currentCoins < amount) {
      console.error('Insufficient coins for deduction');
      return false;
    }

    const newCoins = currentCoins - amount;
    const newSpentCoins = currentSpentCoins + amount;

    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ 
        coins: newCoins,
        spent_coins: newSpentCoins
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error deducting coins:', updateError);
      return false;
    }

    // Add history entry
    await addCoinHistoryEntry(userId, -amount, reason, relatedEntityType, relatedEntityId);

    return true;
  } catch (error) {
    console.error('Error deducting coins with history:', error);
    return false;
  }
};
