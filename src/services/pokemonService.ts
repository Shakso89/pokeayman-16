import { supabase } from '@/integrations/supabase/client';
import { removeCoinsFromStudentEnhanced } from '@/services/enhancedCoinService';
import { getStudentPokemonCount } from '@/utils/creditSystem';

export interface PokemonCatalogItem {
  id: string;
  name: string;
  image_url?: string;
  type_1: string;
  type_2?: string;
  rarity: string;
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
  pokemon?: PokemonCatalogItem;
  pokemon_catalog?: PokemonCatalogItem;
}

export const getPokemonCatalog = async (): Promise<PokemonCatalogItem[]> => {
  try {
    console.log("🔍 Fetching Pokemon catalog from pokemon_pool...");
    
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
    return [];
  }
};

export const getStudentPokemonCollection = async (studentId: string): Promise<StudentPokemonCollectionItem[]> => {
  try {
    console.log("🔍 Fetching student Pokemon collection for:", studentId);
    
    if (!studentId || studentId === 'undefined') {
      console.warn("❌ Invalid studentId provided:", studentId);
      return [];
    }

    // First try the new table structure
    const { data: collectionData, error: collectionError } = await supabase
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

    if (!collectionError && collectionData) {
      console.log("✅ Found collections in student_pokemon_collection:", collectionData.length);
      return collectionData.map(item => ({
        ...item,
        pokemon: Array.isArray(item.pokemon_pool) ? item.pokemon_pool[0] : item.pokemon_pool as PokemonCatalogItem,
        pokemon_catalog: Array.isArray(item.pokemon_pool) ? item.pokemon_pool[0] : item.pokemon_pool as PokemonCatalogItem
      }));
    }

    // Fallback to older table structure if needed
    console.log("🔄 Trying fallback table pokemon_collections...");
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('pokemon_collections')
      .select(`
        id,
        student_id,
        pokemon_id,
        obtained_at,
        pokemon_catalog (
          id,
          name,
          image,
          type,
          rarity,
          power_stats
        )
      `)
      .eq('student_id', studentId)
      .order('obtained_at', { ascending: false });

    if (fallbackError) {
      console.error("❌ Error in fallback query:", fallbackError);
      return [];
    }

    console.log("✅ Found collections in pokemon_collections:", fallbackData?.length || 0);
    return (fallbackData || []).map(item => {
      const pokemonData = Array.isArray(item.pokemon_catalog) ? item.pokemon_catalog[0] : item.pokemon_catalog;
      return {
        id: item.id,
        student_id: item.student_id,
        pokemon_id: item.pokemon_id,
        awarded_at: item.obtained_at,
        source: 'legacy',
        pokemon: {
          id: pokemonData?.id || item.pokemon_id,
          name: pokemonData?.name || 'Unknown Pokemon',
          image_url: pokemonData?.image || '',
          type_1: pokemonData?.type || 'normal',
          rarity: pokemonData?.rarity || 'common',
          price: 15,
          power_stats: pokemonData?.power_stats
        } as PokemonCatalogItem
      };
    });

  } catch (error) {
    console.error("❌ Unexpected error fetching student collection:", error);
    return [];
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

    // Deduct coins first
    const coinResult = await removeCoinsFromStudentEnhanced(
      studentId,
      price,
      `Shop purchase: ${pokemon.name}`,
      "shop_purchase"
    );

    if (!coinResult.success) {
      console.error("❌ Failed to deduct coins:", coinResult.error);
      return { success: false, error: coinResult.error };
    }

    console.log("✅ Coins deducted successfully, new balance:", coinResult.newBalance);

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
      // Try to refund coins if collection insert failed
      try {
        await supabase.rpc('award_coins_to_student_enhanced', {
          p_student_id: studentId,
          p_amount: price,
          p_reason: 'Refund for failed purchase'
        });
      } catch (refundError) {
        console.error("❌ Failed to refund coins:", refundError);
      }
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

export const awardPokemonToStudent = async (
  studentId: string,
  pokemonId: string,
  source: string = "teacher_award"
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
