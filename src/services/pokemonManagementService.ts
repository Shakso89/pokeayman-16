import { supabase } from '@/integrations/supabase/client';

export interface Pokemon {
  id: string;
  name: string;
  image_url: string | null;
  type_1: string;
  type_2: string | null;
  rarity: string;
  price: number;
  description: string | null;
}

// Alias for compatibility
export type PokemonCatalogItem = Pokemon;

export interface StudentPokemon {
  id: string;
  student_id: string;
  pokemon_id: string;
  source: string;
  awarded_at: string;
  awarded_by: string | null;
  pokemon_pool: Pokemon | null;
}

export interface StudentData {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
}

/**
 * Get all available Pokemon from the pool
 */
export const getAllPokemon = async (): Promise<Pokemon[]> => {
  console.log('🔍 Fetching all Pokemon from pool...');
  
  const { data, error } = await supabase
    .from('pokemon_pool')
    .select('*')
    .order('name');

  if (error) {
    console.error('❌ Error fetching Pokemon:', error);
    throw new Error(`Failed to fetch Pokemon: ${error.message}`);
  }

  console.log(`✅ Found ${data?.length || 0} Pokemon in pool`);
  return data || [];
};

// Alias for compatibility
export const getPokemonCatalog = getAllPokemon;

/**
 * Get student's Pokemon collection
 */
export const getStudentPokemonCollection = async (studentId: string): Promise<StudentPokemon[]> => {
  console.log('🔍 Fetching student Pokemon collection for:', studentId);
  
  const { data, error } = await supabase
    .from('student_pokemon_collection')
    .select(`
      *,
      pokemon_pool (*)
    `)
    .eq('student_id', studentId)
    .order('awarded_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching student Pokemon:', error);
    throw new Error(`Failed to fetch student Pokemon: ${error.message}`);
  }

  console.log(`✅ Found ${data?.length || 0} Pokemon for student`);
  return data || [];
};

/**
 * Award a Pokemon to a student
 */
export const awardPokemonToStudent = async (
  studentId: string,
  pokemonId: string,
  source: string = 'teacher_award'
): Promise<boolean> => {
  console.log('🎁 Awarding Pokemon:', { studentId, pokemonId, source });

  try {
    // Validate inputs
    if (!studentId || studentId === 'undefined') {
      throw new Error('Invalid student ID');
    }

    if (!pokemonId || pokemonId === 'undefined') {
      throw new Error('Invalid Pokemon ID');
    }

    // Verify Pokemon exists
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_pool')
      .select('id, name')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      throw new Error('Pokemon not found in pool');
    }

    // Award Pokemon to student
    const { error: insertError } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source: source,
        awarded_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (insertError) {
      console.error('❌ Failed to award Pokemon:', insertError);
      throw new Error(`Failed to award Pokemon: ${insertError.message}`);
    }

    console.log(`✅ Successfully awarded ${pokemon.name} to student`);
    return true;

  } catch (error) {
    console.error('❌ Error in awardPokemonToStudent:', error);
    throw error;
  }
};

/**
 * Remove a Pokemon from student's collection
 */
export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  console.log('🗑️ Removing Pokemon from collection:', collectionId);

  try {
    const { error } = await supabase
      .from('student_pokemon_collection')
      .delete()
      .eq('id', collectionId);

    if (error) {
      console.error('❌ Failed to remove Pokemon:', error);
      throw new Error(`Failed to remove Pokemon: ${error.message}`);
    }

    console.log('✅ Successfully removed Pokemon from collection');
    return true;

  } catch (error) {
    console.error('❌ Error in removePokemonFromStudent:', error);
    throw error;
  }
};

/**
 * Get students for a class
 */
export const getClassStudents = async (classId: string): Promise<StudentData[]> => {
  console.log('🔍 Fetching students for class:', classId);

  const { data, error } = await supabase
    .from('student_profiles')
    .select('id, user_id, username, display_name')
    .eq('class_id', classId)
    .order('display_name');

  if (error) {
    console.error('❌ Error fetching students:', error);
    throw new Error(`Failed to fetch students: ${error.message}`);
  }

  console.log(`✅ Found ${data?.length || 0} students in class`);
  return data || [];
};

/**
 * Award coins to a student
 */
export const awardCoinsToStudent = async (studentId: string, coinAmount: number): Promise<void> => {
  console.log('💰 Awarding coins:', { studentId, coinAmount });

  try {
    // First get current coins
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('coins')
      .eq('user_id', studentId)
      .single();

    const currentCoins = profile?.coins || 0;

    const { error } = await supabase
      .from('student_profiles')
      .update({ 
        coins: currentCoins + coinAmount
      })
      .eq('user_id', studentId);

    if (error) {
      console.error('❌ Failed to award coins:', error);
      throw new Error(`Failed to award coins: ${error.message}`);
    }

    console.log(`✅ Successfully awarded ${coinAmount} coins to student`);
  } catch (error) {
    console.error('❌ Error in awardCoinsToStudent:', error);
    throw error;
  }
};

/**
 * Purchase Pokemon from shop
 */
export const purchasePokemonFromShop = async (studentId: string, pokemonId: string): Promise<{ success: boolean; error?: string }> => {
  console.log('🛒 Processing shop purchase:', { studentId, pokemonId });

  try {
    // Get Pokemon price
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_pool')
      .select('price, name')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      return { success: false, error: 'Pokemon not found' };
    }

    const price = pokemon.price || 15;

    // Check student has enough coins
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', studentId)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Student profile not found' };
    }

    if (profile.coins < price) {
      return { success: false, error: 'Insufficient coins' };
    }

    // Deduct coins and award Pokemon in a transaction
    const { error: deductError } = await supabase
      .from('student_profiles')
      .update({ 
        coins: profile.coins - price,
        spent_coins: (profile.spent_coins || 0) + price
      })
      .eq('user_id', studentId);

    if (deductError) {
      return { success: false, error: 'Failed to deduct coins' };
    }

    // Award Pokemon
    const awarded = await awardPokemonToStudent(studentId, pokemonId, 'shop_purchase');
    if (!awarded) {
      // Refund coins if Pokemon award failed
      await supabase
        .from('student_profiles')
        .update({ 
          coins: profile.coins,
          spent_coins: Math.max((profile.spent_coins || 0) - price, 0)
        })
        .eq('user_id', studentId);
      
      return { success: false, error: 'Failed to award Pokemon' };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error in purchasePokemonFromShop:', error);
    return { success: false, error: 'Purchase failed' };
  }
};