import { supabase } from "@/integrations/supabase/client";
import { Pokemon, StudentPokemonCollection } from "@/types/pokemon";

export const getUnifiedPokemonPool = async (): Promise<Pokemon[]> => {
  try {
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching Pokemon pool:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching Pokemon pool:', error);
    return [];
  }
};

export const getStudentPokemonCollection = async (studentId: string): Promise<StudentPokemonCollection[]> => {
  try {
    console.log('🔍 Fetching Pokemon collection for student:', studentId);

    const { data, error } = await supabase
      .from('student_pokemon_collection')
      .select(`
        *,
        pokemon:pokemon_pool (*)
      `)
      .eq('student_id', studentId)
      .order('awarded_at', { ascending: false });

    if (error) {
      console.error('Error fetching student Pokemon collection:', error);
      return [];
    }

    console.log('📦 Found Pokemon collection:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching student Pokemon collection:', error);
    return [];
  }
};

export const awardPokemonToStudent = async (
  studentId: string,
  pokemonId: string,
  source: 'mystery_ball' | 'teacher_award' | 'shop_purchase' = 'teacher_award',
  awardedBy?: string
): Promise<{ success: boolean; isDuplicate?: boolean; pokemon?: Pokemon; error?: string }> => {
  try {
    console.log('🎁 Awarding Pokemon to student:', { studentId, pokemonId, source });

    // Check if student already has this Pokemon
    const { data: existingCollection } = await supabase
      .from('student_pokemon_collection')
      .select('id')
      .eq('student_id', studentId)
      .eq('pokemon_id', pokemonId)
      .limit(1);

    if (existingCollection && existingCollection.length > 0) {
      console.log('⚠️ Student already has this Pokemon - awarding coins instead');
      
      // Get Pokemon details for response
      const { data: pokemon } = await supabase
        .from('pokemon_pool')
        .select('*')
        .eq('id', pokemonId)
        .single();

      // Award 5 coins for duplicate
      await updateStudentCoins(studentId, 5, 'Duplicate Pokemon dismantled');

      return { 
        success: true, 
        isDuplicate: true, 
        pokemon: pokemon || undefined 
      };
    }

    // Add Pokemon to student's collection
    const { data: newCollection, error: insertError } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source,
        awarded_by: awardedBy
      })
      .select(`
        *,
        pokemon:pokemon_pool (*)
      `)
      .single();

    if (insertError) {
      console.error('Error inserting Pokemon into collection:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Pokemon awarded successfully');
    return { 
      success: true, 
      pokemon: newCollection.pokemon as Pokemon 
    };

  } catch (error) {
    console.error('❌ Error awarding Pokemon:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const purchasePokemonFromShop = async (
  studentId: string,
  pokemonId: string
): Promise<{ success: boolean; error?: string; pokemon?: Pokemon }> => {
  try {
    // Get Pokemon details and price
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_pool')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      return { success: false, error: 'Pokemon not found' };
    }

    // Check student's current coins
    const { data: studentProfile, error: profileError } = await supabase
      .from('student_profiles')
      .select('coins')
      .eq('user_id', studentId)
      .single();

    if (profileError || !studentProfile) {
      return { success: false, error: 'Student profile not found' };
    }

    if (studentProfile.coins < pokemon.price) {
      return { success: false, error: `Not enough coins. Need ${pokemon.price} coins.` };
    }

    // Deduct coins and award Pokemon
    const coinUpdateResult = await updateStudentCoins(studentId, -pokemon.price, `Purchased ${pokemon.name}`);
    if (!coinUpdateResult) {
      return { success: false, error: 'Failed to deduct coins' };
    }

    const awardResult = await awardPokemonToStudent(studentId, pokemonId, 'shop_purchase');
    
    if (!awardResult.success) {
      // Refund coins if Pokemon award failed
      await updateStudentCoins(studentId, pokemon.price, `Refund for failed ${pokemon.name} purchase`);
      return { success: false, error: awardResult.error };
    }

    if (awardResult.isDuplicate) {
      // Refund purchase price and keep the 5 duplicate coins
      await updateStudentCoins(studentId, pokemon.price, `Refund for duplicate ${pokemon.name}`);
      return { 
        success: true, 
        pokemon: awardResult.pokemon,
        error: 'You already own this Pokemon! Purchase refunded and you received 5 coins instead.'
      };
    }

    return { success: true, pokemon: awardResult.pokemon };

  } catch (error) {
    console.error('❌ Error purchasing Pokemon:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const assignRandomPokemonToStudent = async (studentId: string): Promise<{ success: boolean; pokemon?: Pokemon; error?: string }> => {
  try {
    // Get all Pokemon from the pool
    const allPokemon = await getUnifiedPokemonPool();
    
    if (allPokemon.length === 0) {
      return { success: false, error: 'No Pokemon available in pool' };
    }

    // Select random Pokemon
    const randomPokemon = allPokemon[Math.floor(Math.random() * allPokemon.length)];
    
    const result = await awardPokemonToStudent(studentId, randomPokemon.id, 'mystery_ball');
    
    return {
      success: result.success,
      pokemon: result.pokemon,
      error: result.error
    };

  } catch (error) {
    console.error('❌ Error assigning random Pokemon:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

const updateStudentCoins = async (studentId: string, amount: number, reason: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_profiles')
      .update({ 
        coins: amount > 0 ? supabase.sql`coins + ${amount}` : supabase.sql`coins - ${Math.abs(amount)}`
      })
      .eq('user_id', studentId);

    if (error) {
      console.error('Error updating student coins:', error);
      return false;
    }

    // Log the coin transaction
    await supabase
      .from('coin_history')
      .insert({
        user_id: studentId,
        change_amount: amount,
        reason
      });

    return true;
  } catch (error) {
    console.error('Error in coin update:', error);
    return false;
  }
};

export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_pokemon_collection')
      .delete()
      .eq('id', collectionId);

    if (error) {
      console.error('Error removing Pokemon from collection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing Pokemon:', error);
    return false;
  }
};
