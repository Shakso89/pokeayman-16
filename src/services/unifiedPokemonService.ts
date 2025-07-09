
import { supabase } from '@/integrations/supabase/client';

export interface StudentPokemonCollection {
  id: string;
  student_id: string;
  pokemon_id: string;
  awarded_at: string;
  source: string;
  pokemon_pool?: {
    id: string;
    name: string;
    image_url?: string;
    type_1: string;
    type_2?: string;
    rarity: string;
    price: number;
    description?: string;
    power_stats?: any;
  };
}

export interface PokemonFromPool {
  id: string;
  name: string;
  image_url: string;
  type_1: string;
  type_2?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  price: number;
  description?: string;
  power_stats?: any;
}

export const getStudentPokemonCollection = async (studentId: string): Promise<StudentPokemonCollection[]> => {
  try {
    console.log("🔍 Unified Pokemon Service: Fetching collection for:", studentId);
    
    if (!studentId || studentId === 'undefined' || studentId === '') {
      console.warn("❌ Invalid studentId provided:", studentId);
      return [];
    }

    // Query the student_pokemon_collection table with pokemon_pool join
    const { data: collection, error } = await supabase
      .from('student_pokemon_collection')
      .select(`
        id,
        student_id,
        pokemon_id,
        awarded_at,
        source,
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

    console.log("✅ Found collections in student_pokemon_collection:", collection?.length || 0);
    
    // Transform the data to match the expected format
    const transformedCollection = collection?.map(item => ({
      id: item.id,
      student_id: item.student_id,
      pokemon_id: item.pokemon_id,
      awarded_at: item.awarded_at,
      source: item.source || 'unknown',
      // Fix: pokemon_pool should be a single object, not an array
      pokemon_pool: Array.isArray(item.pokemon_pool) ? item.pokemon_pool[0] : item.pokemon_pool
    })) || [];

    console.log("✅ Transformed collection:", transformedCollection);
    return transformedCollection;

  } catch (error) {
    console.error("❌ Unexpected error in unified Pokemon service:", error);
    return [];
  }
};

export const getPokemonPool = async (): Promise<PokemonFromPool[]> => {
  try {
    console.log("🔍 Fetching Pokemon pool from pokemon_pool...");
    
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .order('name');

    if (error) {
      console.error("❌ Error fetching Pokemon pool:", error);
      throw error;
    }

    console.log("✅ Pokemon pool loaded:", data?.length || 0);
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      image_url: item.image_url || '/placeholder.svg',
      type_1: item.type_1,
      type_2: item.type_2,
      rarity: item.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
      price: item.price,
      description: item.description,
      power_stats: item.power_stats
    }));
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokemon pool:", error);
    throw error;
  }
};

export const purchasePokemonFromShop = async (
  studentId: string,
  pokemonId: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  try {
    console.log("🛒 Starting Pokemon purchase:", { studentId, pokemonId });

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
    console.log("💰 Pokemon price:", price);

    // Get current student data
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins, user_id')
      .eq('user_id', studentId)
      .single();

    let currentCoins = 0;
    let currentSpentCoins = 0;

    if (profileData) {
      currentCoins = profileData.coins || 0;
      currentSpentCoins = profileData.spent_coins || 0;
      console.log("💰 Current coins:", currentCoins);
    } else {
      console.error("❌ Student profile not found:", profileError);
      return { success: false, error: "Student not found" };
    }

    // Check if student has enough coins
    if (currentCoins < price) {
      console.error("❌ Insufficient coins:", currentCoins, "< required:", price);
      return { success: false, error: `Not enough coins! You need ${price} coins but only have ${currentCoins}.` };
    }

    const newCoins = currentCoins - price;
    const newSpentCoins = currentSpentCoins + price;

    // Update coins
    const { error: profileUpdateError } = await supabase
      .from('student_profiles')
      .update({ 
        coins: newCoins,
        spent_coins: newSpentCoins
      })
      .eq('user_id', studentId);

    if (profileUpdateError) {
      console.error("❌ Failed to update profile coins:", profileUpdateError);
      return { success: false, error: "Failed to deduct coins from profile" };
    }

    console.log("✅ Coins deducted successfully, new balance:", newCoins);

    // Add Pokemon to student_pokemon_collection
    console.log("🔄 Adding Pokemon to student_pokemon_collection...");
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
      console.log("🔄 Rolling back coin deduction...");
      await supabase
        .from('student_profiles')
        .update({ 
          coins: currentCoins,
          spent_coins: currentSpentCoins
        })
        .eq('user_id', studentId);
        
      return { success: false, error: "Failed to add Pokemon to collection" };
    }

    // Log coin transaction
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

    console.log("✅ Pokemon purchase completed successfully:", collection);
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

export const awardPokemonToStudent = async (
  studentId: string,
  pokemonId: string,
  source: string = 'teacher_award'
): Promise<boolean> => {
  try {
    console.log("🎁 Awarding Pokemon to student:", { studentId, pokemonId, source });

    const { error } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source: source
      });

    if (error) {
      console.error("❌ Error awarding Pokemon:", error);
      return false;
    }

    console.log("✅ Pokemon awarded successfully");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error awarding Pokemon:", error);
    return false;
  }
};

export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  try {
    console.log("🗑️ Removing Pokemon from student collection:", collectionId);

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

export const addPokemonToCollection = async (
  studentId: string,
  pokemonId: string,
  source: string = 'manual'
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("📝 Adding Pokemon to collection:", { studentId, pokemonId, source });

    const { error } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source: source
      });

    if (!error) {
      console.log("✅ Pokemon added to student_pokemon_collection");
      return { success: true };
    }

    console.error("❌ Failed to add Pokemon to collection:", error);
    return { success: false, error: error.message };

  } catch (error) {
    console.error("❌ Unexpected error adding Pokemon:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

export const getPokemonPoolStats = async () => {
  try {
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('rarity');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      byRarity: {} as Record<string, number>
    };

    data?.forEach(item => {
      const rarity = item.rarity || 'common';
      stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error("❌ Error fetching Pokemon pool stats:", error);
    return { total: 0, byRarity: {} };
  }
};

// Get student Pokemon count - unified function
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
