
import { supabase } from '@/integrations/supabase/client';
import { StudentPokemonCollectionItem } from '@/services/pokemonService';

export interface StudentPokemonCollection {
  id: string;
  student_id: string;
  pokemon_id: string;
  awarded_at: string;
  source: string;
  pokemon?: {
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
  pokemon_catalog?: any;
}

export const getStudentPokemonCollection = async (studentId: string): Promise<StudentPokemonCollection[]> => {
  try {
    console.log("🔍 Unified Pokemon Service: Fetching collection for:", studentId);
    
    if (!studentId || studentId === 'undefined') {
      console.warn("❌ Invalid studentId provided:", studentId);
      return [];
    }

    // First try the main student_pokemon_collection table
    const { data: mainCollection, error: mainError } = await supabase
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

    if (!mainError && mainCollection && mainCollection.length > 0) {
      console.log("✅ Found collections in student_pokemon_collection:", mainCollection.length);
      return mainCollection.map(item => ({
        ...item,
        pokemon: Array.isArray(item.pokemon_pool) ? item.pokemon_pool[0] : item.pokemon_pool
      }));
    }

    // Fallback to pokemon_collections table
    console.log("🔄 Trying fallback table pokemon_collections...");
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('pokemon_collections')
      .select('*')
      .eq('student_id', studentId)
      .order('obtained_at', { ascending: false });

    if (fallbackError) {
      console.error("❌ Error in fallback query:", fallbackError);
      return [];
    }

    console.log("✅ Found collections in pokemon_collections:", fallbackData?.length || 0);
    return (fallbackData || []).map(item => ({
      id: item.id,
      student_id: item.student_id,
      pokemon_id: item.pokemon_id,
      awarded_at: item.obtained_at,
      source: 'legacy',
      pokemon: {
        id: item.pokemon_id,
        name: item.pokemon_name || 'Unknown Pokemon',
        image_url: item.pokemon_image || '',
        type_1: item.pokemon_type || 'normal',
        rarity: item.pokemon_rarity || 'common',
        price: 15,
        power_stats: item.pokemon_catalog?.power_stats
      }
    }));

  } catch (error) {
    console.error("❌ Unexpected error in unified Pokemon service:", error);
    return [];
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
