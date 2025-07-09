
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for Pokemon operations
export interface PokemonCatalogItem {
  id: string;
  name: string;
  image_url?: string;
  type_1: string;
  type_2?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  price: number;
  description?: string;
  power_stats?: any;
}

export interface StudentPokemonCollectionItem {
  id: string;
  student_id: string;
  pokemon_id: string;
  awarded_at: string;
  source: string;
  awarded_by?: string;
  pokemon_pool?: PokemonCatalogItem; // Changed from optional array to optional single object
}

// Get Pokemon catalog (all available Pokemon)
export const getPokemonCatalog = async (): Promise<PokemonCatalogItem[]> => {
  try {
    console.log("🔍 Fetching Pokemon catalog...");
    
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .order('name');

    if (error) {
      console.error("❌ Error fetching Pokemon catalog:", error);
      throw error;
    }

    console.log("✅ Pokemon catalog loaded:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokemon catalog:", error);
    throw error;
  }
};

// Get student's Pokemon collection
export const getStudentPokemonCollection = async (studentId: string): Promise<StudentPokemonCollectionItem[]> => {
  try {
    console.log("🔍 Fetching Pokemon collection for student:", studentId);
    
    if (!studentId || studentId === 'undefined') {
      console.warn("❌ Invalid studentId provided:", studentId);
      return [];
    }

    const { data, error } = await supabase
      .from('student_pokemon_collection')
      .select(`
        id,
        student_id,
        pokemon_id,
        awarded_at,
        source,
        awarded_by,
        pokemon_pool!inner (
          id,
          name,
          image_url,
          type_1,
          type_2,
          rarity,
          price,
          description,
          power_stats
        )
      `)
      .eq('student_id', studentId)
      .order('awarded_at', { ascending: false });

    if (error) {
      console.error("❌ Error fetching Pokemon collection:", error);
      return [];
    }

    console.log("✅ Pokemon collection loaded:", data?.length || 0);
    
    // Fix the type mismatch by ensuring pokemon_pool is a single object
    const transformedData = data?.map(item => ({
      id: item.id,
      student_id: item.student_id,
      pokemon_id: item.pokemon_id,
      awarded_at: item.awarded_at,
      source: item.source || 'unknown',
      awarded_by: item.awarded_by,
      pokemon_pool: Array.isArray(item.pokemon_pool) ? item.pokemon_pool[0] : item.pokemon_pool
    })) || [];

    return transformedData;
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokemon collection:", error);
    return [];
  }
};

// Award Pokemon to student (teacher action)
export const awardPokemonToStudent = async (
  studentId: string,
  pokemonId: string,
  awardedBy?: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  try {
    console.log("🎁 Awarding Pokemon to student:", { studentId, pokemonId, awardedBy });

    if (!studentId || studentId === 'undefined') {
      return { success: false, error: "Invalid student ID" };
    }

    if (!pokemonId) {
      return { success: false, error: "Invalid Pokemon ID" };
    }

    // Get Pokemon details first
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_pool')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      console.error("❌ Pokemon not found:", pokemonError);
      return { success: false, error: "Pokemon not found" };
    }

    // Add Pokemon to student collection
    const { data: collection, error: collectionError } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source: 'teacher_award',
        awarded_by: awardedBy
      })
      .select()
      .single();

    if (collectionError) {
      console.error("❌ Failed to award Pokemon:", collectionError);
      return { success: false, error: collectionError.message };
    }

    console.log("✅ Pokemon awarded successfully:", collection);
    return { 
      success: true, 
      pokemon: { ...pokemon, collectionId: collection.id }
    };

  } catch (error) {
    console.error("❌ Unexpected error awarding Pokemon:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Purchase Pokemon from shop (student action)
export const purchasePokemonFromShop = async (
  studentId: string,
  pokemonId: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  try {
    console.log("🛒 Student purchasing Pokemon:", { studentId, pokemonId });

    if (!studentId || studentId === 'undefined') {
      return { success: false, error: "Invalid student ID" };
    }

    if (!pokemonId) {
      return { success: false, error: "Invalid Pokemon ID" };
    }

    // Get Pokemon details and price
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_pool')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      console.error("❌ Pokemon not found:", pokemonError);
      return { success: false, error: "Pokemon not found" };
    }

    const price = pokemon.price || 15;

    // Get student's current coins
    const { data: student, error: studentError } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('user_id', studentId)
      .single();

    if (studentError || !student) {
      console.error("❌ Student not found:", studentError);
      return { success: false, error: "Student not found" };
    }

    const currentCoins = student.coins || 0;
    const currentSpentCoins = student.spent_coins || 0;

    // Check if student has enough coins
    if (currentCoins < price) {
      return { 
        success: false, 
        error: `Not enough coins! You need ${price} coins but only have ${currentCoins}.` 
      };
    }

    // Start transaction: deduct coins first
    const newCoins = currentCoins - price;
    const newSpentCoins = currentSpentCoins + price;

    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ 
        coins: newCoins,
        spent_coins: newSpentCoins
      })
      .eq('user_id', studentId);

    if (updateError) {
      console.error("❌ Failed to deduct coins:", updateError);
      return { success: false, error: "Failed to deduct coins" };
    }

    // Add Pokemon to collection
    const { data: collection, error: collectionError } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source: 'shop_purchase'
      })
      .select()
      .single();

    if (collectionError) {
      console.error("❌ Failed to add Pokemon to collection:", collectionError);
      
      // Rollback coin deduction
      await supabase
        .from('student_profiles')
        .update({ 
          coins: currentCoins,
          spent_coins: currentSpentCoins
        })
        .eq('user_id', studentId);
        
      return { success: false, error: "Failed to add Pokemon to collection" };
    }

    // Log the transaction
    try {
      await supabase
        .from('coin_history')
        .insert({
          user_id: studentId,
          change_amount: -price,
          reason: `Shop purchase: ${pokemon.name}`,
          related_entity_type: 'pokemon_purchase',
          related_entity_id: collection.id
        });
    } catch (historyError) {
      console.warn("⚠️ Failed to log coin history:", historyError);
    }

    console.log("✅ Pokemon purchased successfully:", collection);
    return { 
      success: true, 
      pokemon: { ...pokemon, collectionId: collection.id }
    };

  } catch (error) {
    console.error("❌ Unexpected error during Pokemon purchase:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Remove Pokemon from student collection
export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  try {
    console.log("🗑️ Removing Pokemon from collection:", collectionId);

    const { error } = await supabase
      .from('student_pokemon_collection')
      .delete()
      .eq('id', collectionId);

    if (error) {
      console.error("❌ Error removing Pokemon:", error);
      return false;
    }

    console.log("✅ Pokemon removed successfully");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error removing Pokemon:", error);
    return false;
  }
};

// Get Pokemon count for a student
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
    console.error("❌ Unexpected error fetching Pokemon count:", error);
    return 0;
  }
};

// Get Pokemon collection stats
export const getPokemonCollectionStats = async (studentId: string) => {
  try {
    const collection = await getStudentPokemonCollection(studentId);
    
    const stats = {
      total: collection.length,
      byRarity: {} as Record<string, number>,
      bySource: {} as Record<string, number>
    };

    collection.forEach(item => {
      const rarity = item.pokemon_pool?.rarity || 'common';
      const source = item.source || 'unknown';
      
      stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + 1;
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error("❌ Error fetching collection stats:", error);
    return { total: 0, byRarity: {}, bySource: {} };
  }
};
