
import { supabase } from "@/integrations/supabase/client";

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
  created_at: string;
}

export interface StudentPokemonCollection {
  id: string;
  student_id: string;
  pokemon_id: string;
  source: 'mystery_ball' | 'teacher_award' | 'shop_purchase';
  awarded_by?: string;
  awarded_at: string;
  pokemon?: PokemonFromPool;
}

// Get all Pokémon from the unified pool
export const getPokemonPool = async (): Promise<PokemonFromPool[]> => {
  try {
    console.log("🎯 Fetching unified Pokémon pool...");
    
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .order('name');

    if (error) {
      console.error("❌ Error fetching Pokémon pool:", error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} Pokémon from unified pool`);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokémon pool:", error);
    return [];
  }
};

// Get Pokémon by rarity
export const getPokemonByRarity = async (rarity: string): Promise<PokemonFromPool[]> => {
  try {
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .eq('rarity', rarity)
      .order('name');

    if (error) {
      console.error("❌ Error fetching Pokémon by rarity:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokémon by rarity:", error);
    return [];
  }
};

// Get random Pokémon from pool
export const getRandomPokemonFromPool = async (): Promise<PokemonFromPool | null> => {
  try {
    // Get total count first
    const { count, error: countError } = await supabase
      .from('pokemon_pool')
      .select('*', { count: 'exact', head: true });

    if (countError || !count) {
      console.error("❌ Error getting Pokémon count:", countError);
      return null;
    }

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count);

    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .range(randomOffset, randomOffset)
      .single();

    if (error) {
      console.error("❌ Error fetching random Pokémon:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("❌ Unexpected error fetching random Pokémon:", error);
    return null;
  }
};

// Award Pokémon to student with proper student ID handling
export const awardPokemonToStudent = async (
  studentId: string,
  pokemonId: string,
  source: 'mystery_ball' | 'teacher_award' | 'shop_purchase' = 'mystery_ball',
  awardedBy?: string
): Promise<boolean> => {
  try {
    console.log("🎁 Awarding Pokémon to student:", { studentId, pokemonId, source });

    // Insert directly using the provided student ID
    const { error } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source,
        awarded_by: awardedBy
      });

    if (error) {
      console.error("❌ Error awarding Pokémon:", error);
      return false;
    }

    console.log("✅ Pokémon awarded successfully");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error awarding Pokémon:", error);
    return false;
  }
};

// Get student's Pokémon collection
export const getStudentPokemonCollection = async (studentId: string): Promise<StudentPokemonCollection[]> => {
  try {
    console.log("📦 Fetching student's Pokémon collection:", studentId);

    const { data, error } = await supabase
      .from('student_pokemon_collection')
      .select(`
        *,
        pokemon:pokemon_pool(*)
      `)
      .eq('student_id', studentId)
      .order('awarded_at', { ascending: false });

    if (error) {
      console.error("❌ Error fetching student's collection:", error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} Pokémon from student's collection`);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching student's collection:", error);
    return [];
  }
};

// Remove Pokémon from student collection
export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  try {
    console.log("🗑️ Removing Pokémon from collection:", collectionId);

    const { error } = await supabase
      .from('student_pokemon_collection')
      .delete()
      .eq('id', collectionId);

    if (error) {
      console.error("❌ Error removing Pokémon:", error);
      return false;
    }

    console.log("✅ Pokémon removed successfully");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error removing Pokémon:", error);
    return false;
  }
};

// Purchase Pokémon from shop
export const purchasePokemonFromShop = async (
  studentId: string,
  pokemonId: string,
  price: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("🛒 Purchasing Pokémon from shop:", { studentId, pokemonId, price });

    // Award the Pokémon to the student
    const success = await awardPokemonToStudent(studentId, pokemonId, 'shop_purchase');

    if (success) {
      console.log("✅ Pokémon purchased successfully");
      return { success: true };
    } else {
      return { success: false, error: "Failed to award Pokémon" };
    }
  } catch (error) {
    console.error("❌ Error purchasing Pokémon:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Mystery ball functionality with unified pool - 50% POKEMON CHANCE
export const openMysteryBall = async (studentId: string): Promise<{ success: boolean; pokemon?: PokemonFromPool; coins?: number; error?: string }> => {
  try {
    console.log("🎲 Opening mystery ball for student:", studentId);

    if (!studentId) {
      return { success: false, error: "Invalid student ID" };
    }

    // 50% chance for Pokémon, 50% chance for coins
    const isPokemon = Math.random() < 0.5;

    if (isPokemon) {
      // Get a random Pokémon with rarity weighting
      const rarityRoll = Math.random();
      let targetRarity: string;
      
      if (rarityRoll < 0.5) targetRarity = 'common';
      else if (rarityRoll < 0.8) targetRarity = 'uncommon';
      else if (rarityRoll < 0.95) targetRarity = 'rare';
      else targetRarity = 'legendary';

      console.log("🎯 Target rarity:", targetRarity);
      
      const pokemonOfRarity = await getPokemonByRarity(targetRarity);
      
      if (pokemonOfRarity.length > 0) {
        const randomPokemon = pokemonOfRarity[Math.floor(Math.random() * pokemonOfRarity.length)];
        console.log("🎲 Selected Pokémon:", randomPokemon.name);
        
        // Award the Pokémon
        const awarded = await awardPokemonToStudent(studentId, randomPokemon.id, 'mystery_ball');
        
        if (awarded) {
          console.log("✅ Pokémon successfully awarded");
          return { success: true, pokemon: randomPokemon };
        } else {
          console.log("❌ Failed to award Pokémon, giving coins instead");
          // Fallback to coins if Pokémon award failed
          const coinAmount = Math.floor(Math.random() * 16) + 5;
          return { success: true, coins: coinAmount };
        }
      } else {
        console.log("❌ No Pokémon found for rarity, giving coins instead");
        // Fallback to coins if no Pokémon found
        const coinAmount = Math.floor(Math.random() * 16) + 5;
        return { success: true, coins: coinAmount };
      }
    } else {
      // Give coins (5-20 coins)
      const coinAmount = Math.floor(Math.random() * 16) + 5;
      console.log("💰 Awarding coins:", coinAmount);
      return { success: true, coins: coinAmount };
    }
  } catch (error) {
    console.error("❌ Error opening mystery ball:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Get Pokémon pool statistics
export const getPokemonPoolStats = async () => {
  try {
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('rarity')
      .order('rarity');

    if (error) {
      console.error("❌ Error fetching pool stats:", error);
      return { total: 0, byRarity: {} };
    }

    const stats = data.reduce((acc: any, pokemon: any) => {
      acc.byRarity[pokemon.rarity] = (acc.byRarity[pokemon.rarity] || 0) + 1;
      acc.total++;
      return acc;
    }, { total: 0, byRarity: {} });

    return stats;
  } catch (error) {
    console.error("❌ Unexpected error fetching pool stats:", error);
    return { total: 0, byRarity: {} };
  }
};

// Export aliases for backward compatibility
export const getUnifiedPokemonPool = getPokemonPool;
export const assignRandomPokemonToStudent = async (studentId: string): Promise<{ success: boolean; pokemon?: PokemonFromPool; isDuplicate?: boolean }> => {
  try {
    const randomPokemon = await getRandomPokemonFromPool();
    if (!randomPokemon) {
      return { success: false };
    }

    const success = await awardPokemonToStudent(studentId, randomPokemon.id, 'mystery_ball');
    
    if (success) {
      return { success: true, pokemon: randomPokemon, isDuplicate: false };
    }
    
    return { success: false };
  } catch (error) {
    console.error("❌ Error assigning random Pokémon:", error);
    return { success: false };
  }
};
