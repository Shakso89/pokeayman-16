
import { supabase } from "@/integrations/supabase/client";
import { Pokemon } from "@/types/pokemon";

export interface StudentProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  teacher_id?: string;
  class_id?: string;
  school_id?: string;
  avatar_url?: string;
  coins: number;
  spent_coins: number;
  created_at: string;
  updated_at: string;
}

export interface PokemonCollection {
  id: string;
  student_id: string;
  pokemon_id: string;
  pokemon_name: string;
  pokemon_image?: string;
  pokemon_type?: string;
  pokemon_rarity?: string;
  pokemon_level: number;
  obtained_at: string;
}

export interface MysteryBallHistoryRecord {
  id: string;
  student_id: string;
  result_type: 'pokemon' | 'coins' | 'nothing';
  pokemon_id?: string;
  pokemon_name?: string;
  coins_amount?: number;
  created_at: string;
}

// Get or create student profile
export const getOrCreateStudentProfile = async (
  userId: string,
  username: string,
  displayName?: string
): Promise<StudentProfile | null> => {
  try {
    // First try to get existing profile
    const { data: existingProfile, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile if it doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from('student_profiles')
      .insert({
        user_id: userId,
        username,
        display_name: displayName || username,
        coins: 0,
        spent_coins: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating student profile:', createError);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error('Error in getOrCreateStudentProfile:', error);
    return null;
  }
};

// Get student's Pokemon collection
export const getStudentPokemonCollection = async (studentId: string): Promise<Pokemon[]> => {
  try {
    const { data, error } = await supabase
      .from('pokemon_collections')
      .select('*')
      .eq('student_id', studentId)
      .order('obtained_at', { ascending: false });

    if (error) {
      console.error('Error fetching pokemon collection:', error);
      return [];
    }

    return data.map(item => ({
      id: item.pokemon_id,
      name: item.pokemon_name,
      image: item.pokemon_image || '',
      type: item.pokemon_type || '',
      rarity: item.pokemon_rarity as any || 'common'
    }));
  } catch (error) {
    console.error('Error in getStudentPokemonCollection:', error);
    return [];
  }
};

// Add Pokemon to student's collection
export const addPokemonToCollection = async (
  studentId: string,
  pokemon: Pokemon
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentId,
        pokemon_id: pokemon.id,
        pokemon_name: pokemon.name,
        pokemon_image: pokemon.image,
        pokemon_type: pokemon.type,
        pokemon_rarity: pokemon.rarity,
        pokemon_level: 1
      });

    if (error) {
      console.error('Error adding pokemon to collection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addPokemonToCollection:', error);
    return false;
  }
};

// Update student coins
export const updateStudentCoins = async (
  studentId: string,
  coinsToAdd: number,
  spentCoins?: number
): Promise<boolean> => {
  try {
    const { data: currentProfile } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('id', studentId)
      .single();

    if (!currentProfile) return false;

    const newCoins = Math.max(0, currentProfile.coins + coinsToAdd);
    const newSpentCoins = currentProfile.spent_coins + (spentCoins || 0);

    const { error } = await supabase
      .from('student_profiles')
      .update({
        coins: newCoins,
        spent_coins: newSpentCoins,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId);

    if (error) {
      console.error('Error updating student coins:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateStudentCoins:', error);
    return false;
  }
};

// Get student profile by ID
export const getStudentProfileById = async (studentId: string): Promise<StudentProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getStudentProfileById:', error);
    return null;
  }
};

// Add mystery ball history record
export const addMysteryBallHistory = async (
  studentId: string,
  resultType: 'pokemon' | 'coins' | 'nothing',
  pokemon?: Pokemon,
  coinsAmount?: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('mystery_ball_history')
      .insert({
        student_id: studentId,
        result_type: resultType,
        pokemon_id: pokemon?.id,
        pokemon_name: pokemon?.name,
        coins_amount: coinsAmount
      });

    if (error) {
      console.error('Error adding mystery ball history:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addMysteryBallHistory:', error);
    return false;
  }
};

// Get mystery ball history
export const getMysteryBallHistory = async (studentId: string): Promise<MysteryBallHistoryRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('mystery_ball_history')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching mystery ball history:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getMysteryBallHistory:', error);
    return [];
  }
};

// Check if daily attempt is available
export const checkDailyAttempt = async (studentId: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('attempt_date', today)
      .maybeSingle();

    if (error) {
      console.error('Error checking daily attempt:', error);
      return false;
    }

    return !data || !data.used;
  } catch (error) {
    console.error('Error in checkDailyAttempt:', error);
    return false;
  }
};

// Use daily attempt
export const useDailyAttempt = async (studentId: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('daily_attempts')
      .upsert({
        student_id: studentId,
        attempt_date: today,
        used: true
      });

    if (error) {
      console.error('Error using daily attempt:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in useDailyAttempt:', error);
    return false;
  }
};

// Get Pokemon pools for a school
export const getSchoolPokemonPool = async (schoolId: string): Promise<Pokemon[]> => {
  try {
    const { data, error } = await supabase
      .from('pokemon_pools')
      .select('*')
      .eq('school_id', schoolId)
      .eq('available', true);

    if (error) {
      console.error('Error fetching pokemon pool:', error);
      return [];
    }

    return data.map(item => ({
      id: item.pokemon_id,
      name: item.pokemon_name,
      image: item.pokemon_image || '',
      type: item.pokemon_type || '',
      rarity: item.pokemon_rarity as any || 'common'
    }));
  } catch (error) {
    console.error('Error in getSchoolPokemonPool:', error);
    return [];
  }
};

// Remove Pokemon from pool and add to student collection
export const assignPokemonFromPool = async (
  schoolId: string,
  studentId: string,
  pokemonId: string
): Promise<{ success: boolean; pokemon?: Pokemon }> => {
  try {
    // Start a transaction-like operation
    const { data: poolPokemon, error: fetchError } = await supabase
      .from('pokemon_pools')
      .select('*')
      .eq('school_id', schoolId)
      .eq('pokemon_id', pokemonId)
      .eq('available', true)
      .limit(1)
      .maybeSingle();

    if (fetchError || !poolPokemon) {
      console.error('Pokemon not found in pool:', fetchError);
      return { success: false };
    }

    const pokemon: Pokemon = {
      id: poolPokemon.pokemon_id,
      name: poolPokemon.pokemon_name,
      image: poolPokemon.pokemon_image || '',
      type: poolPokemon.pokemon_type || '',
      rarity: poolPokemon.pokemon_rarity as any || 'common'
    };

    // Check if student already has this Pokemon (duplicate handling)
    const { data: existingPokemon } = await supabase
      .from('pokemon_collections')
      .select('id')
      .eq('student_id', studentId)
      .eq('pokemon_id', pokemonId)
      .maybeSingle();

    if (existingPokemon) {
      // Give coins instead for duplicate
      const success = await updateStudentCoins(studentId, 10);
      return { success, pokemon };
    }

    // Add to student collection
    const addSuccess = await addPokemonToCollection(studentId, pokemon);
    if (!addSuccess) {
      return { success: false };
    }

    // Mark as unavailable in pool
    const { error: updateError } = await supabase
      .from('pokemon_pools')
      .update({ available: false })
      .eq('id', poolPokemon.id);

    if (updateError) {
      console.error('Error updating pool:', updateError);
      return { success: false };
    }

    return { success: true, pokemon };
  } catch (error) {
    console.error('Error in assignPokemonFromPool:', error);
    return { success: false };
  }
};
