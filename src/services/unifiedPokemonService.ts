import { supabase } from '@/integrations/supabase/client';
import { removeCoinsFromStudentEnhanced } from '@/services/enhancedCoinService';

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
    
    if (!studentId || studentId === 'undefined') {
      console.warn("❌ Invalid studentId provided:", studentId);
      return [];
    }

    // Use student_pokemon_collection as primary source
    const { data: collection, error } = await supabase
      .from('student_pokemon_collection')
      .select(`
        id,
        student_id,
        pokemon_id,
        awarded_at,
        source,
        pokemon_pool!student_pokemon_collection_pokemon_id_fkey (
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
    return collection || [];

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
    return [];
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
        source
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

export const purchasePokemonFromShop = async (
  studentId: string,
  pokemonId: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  try {
    console.log("🛒 Starting Pokemon purchase:", { studentId, pokemonId });

    if (!studentId || studentId === 'undefined') {
      return { success: false, error: "Invalid student ID" };
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

    // Check if student has enough coins
    const { data: studentData, error: studentError } = await supabase
      .from('student_profiles')
      .select('coins')
      .eq('user_id', studentId)
      .single();

    if (studentError || !studentData) {
      console.error("❌ Student not found:", studentError);
      return { success: false, error: "Student not found" };
    }

    if (studentData.coins < price) {
      console.error("❌ Insufficient coins:", studentData.coins, "< required:", price);
      return { success: false, error: `Not enough coins! You need ${price} coins but only have ${studentData.coins}.` };
    }

    // Deduct coins using enhanced service
    const coinResult = await removeCoinsFromStudentEnhanced(
      studentId,
      price,
      `Shop purchase: ${pokemon.name}`,
      "shop_purchase"
    );

    if (!coinResult.success) {
      console.error("❌ Failed to deduct coins:", coinResult.error);
      return { success: false, error: coinResult.error || "Failed to deduct coins" };
    }

    console.log("✅ Coins deducted successfully, new balance:", coinResult.newBalance);

    // Add Pokemon to collection using student_pokemon_collection table
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
      // Try to refund coins if collection insert failed
      await removeCoinsFromStudentEnhanced(
        studentId,
        -price,
        `Refund for failed ${pokemon.name} purchase`,
        "refund"
      );
      return { success: false, error: "Failed to add Pokemon to collection" };
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

export const addPokemonToCollection = async (
  studentId: string,
  pokemonId: string,
  source: string = 'manual'
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("📝 Adding Pokemon to collection:", { studentId, pokemonId, source });

    // Try to add to main collection first
    const { error: mainError } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source: source
      });

    if (!mainError) {
      console.log("✅ Pokemon added to student_pokemon_collection");
      return { success: true };
    }

    // Fallback to pokemon_collections table
    console.log("🔄 Trying fallback insertion to pokemon_collections...");
    const { error: fallbackError } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        pokemon_name: `Pokemon #${pokemonId}`,
        pokemon_type: 'normal',
        pokemon_rarity: 'common'
      });

    if (fallbackError) {
      console.error("❌ Failed to add Pokemon to collection:", fallbackError);
      return { success: false, error: fallbackError.message };
    }

    console.log("✅ Pokemon added to pokemon_collections");
    return { success: true };

  } catch (error) {
    console.error("❌ Unexpected error adding Pokemon:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};
