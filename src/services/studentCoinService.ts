
import { supabase } from '@/integrations/supabase/client';
import { getStudentPokemons, saveStudentPokemons } from '@/utils/pokemon/storage';

export interface StudentCoinData {
  coins: number;
  spent_coins: number;
  pokemonCount: number;
}

// Get student coin and pokemon data from Supabase (primary) with localStorage fallback
export const getStudentCoinData = async (studentId: string): Promise<StudentCoinData> => {
  try {
    // Try Supabase first
    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', studentId)
      .maybeSingle();

    const { data: pokemonData, error: pokemonError } = await supabase
      .from('pokemon_collections')
      .select('id')
      .eq('student_id', studentId);

    if (!error && !pokemonError && profile) {
      return {
        coins: profile.coins || 0,
        spent_coins: profile.spent_coins || 0,
        pokemonCount: pokemonData?.length || 0
      };
    }
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
  }

  // Fallback to localStorage
  const studentPokemons = getStudentPokemons();
  const studentData = studentPokemons.find(sp => sp.studentId === studentId);
  
  return {
    coins: studentData?.coins || 0,
    spent_coins: studentData?.spentCoins || 0,
    pokemonCount: studentData?.pokemons?.length || 0
  };
};

// Update student coins in both Supabase and localStorage
export const updateStudentCoins = async (
  studentId: string, 
  newCoins: number, 
  spentAmount?: number
): Promise<boolean> => {
  try {
    // Update in Supabase
    const updateData: any = { coins: newCoins };
    if (spentAmount !== undefined) {
      const currentData = await getStudentCoinData(studentId);
      updateData.spent_coins = currentData.spent_coins + spentAmount;
    }

    const { error } = await supabase
      .from('student_profiles')
      .update(updateData)
      .eq('user_id', studentId);

    if (error) {
      console.error('Supabase update error:', error);
      // Continue to localStorage update as fallback
    }

    // Update in localStorage for immediate UI update
    const studentPokemons = getStudentPokemons();
    const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
    
    if (studentIndex >= 0) {
      studentPokemons[studentIndex].coins = newCoins;
      if (spentAmount !== undefined) {
        studentPokemons[studentIndex].spentCoins = (studentPokemons[studentIndex].spentCoins || 0) + spentAmount;
      }
    } else {
      studentPokemons.push({
        studentId,
        pokemons: [],
        coins: newCoins,
        spentCoins: spentAmount || 0
      });
    }
    
    saveStudentPokemons(studentPokemons);
    return true;
  } catch (error) {
    console.error('Error updating student coins:', error);
    return false;
  }
};

// Award coins to student
export const awardCoinsToStudent = async (studentId: string, amount: number): Promise<boolean> => {
  const currentData = await getStudentCoinData(studentId);
  return updateStudentCoins(studentId, currentData.coins + amount);
};

// Remove coins from student
export const removeCoinsFromStudent = async (studentId: string, amount: number): Promise<boolean> => {
  const currentData = await getStudentCoinData(studentId);
  if (currentData.coins < amount) {
    return false; // Not enough coins
  }
  return updateStudentCoins(studentId, currentData.coins - amount, amount);
};
