
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

// Get all Pokemon from the unified SITE-WIDE pool (shared by all schools)
export const getPokemonPool = async (): Promise<PokemonFromPool[]> => {
  try {
    console.log("🌍 Fetching unified site-wide Pokemon pool...");
    
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .order('name');

    if (error) {
      console.error("❌ Error fetching site-wide Pokemon pool:", error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} Pokemon from site-wide shared pool`);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokemon pool:", error);
    return [];
  }
};

// Get Pokemon by rarity from shared pool
export const getPokemonByRarity = async (rarity: string): Promise<PokemonFromPool[]> => {
  try {
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .eq('rarity', rarity)
      .order('name');

    if (error) {
      console.error("❌ Error fetching Pokemon by rarity:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokemon by rarity:", error);
    return [];
  }
};

// Get random Pokemon from shared site-wide pool
export const getRandomPokemonFromPool = async (): Promise<PokemonFromPool | null> => {
  try {
    console.log("🎲 Getting random Pokemon from site-wide shared pool...");
    
    // Get total count first
    const { count, error: countError } = await supabase
      .from('pokemon_pool')
      .select('*', { count: 'exact', head: true });

    if (countError || !count) {
      console.error("❌ Error getting Pokemon count:", countError);
      return null;
    }

    console.log(`🎲 Found ${count} Pokemon in shared pool, selecting random one...`);

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count);

    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .range(randomOffset, randomOffset)
      .single();

    if (error) {
      console.error("❌ Error fetching random Pokemon:", error);
      return null;
    }

    console.log(`✅ Selected random Pokemon: ${data.name}`);
    return data;
  } catch (error) {
    console.error("❌ Unexpected error fetching random Pokemon:", error);
    return null;
  }
};

// Award Pokemon to student (creates a copy in their collection)
export const awardPokemonToStudent = async (
  studentId: string,
  pokemonId: string,
  source: 'mystery_ball' | 'teacher_award' | 'shop_purchase' = 'teacher_award',
  awardedBy?: string
): Promise<boolean> => {
  try {
    console.log("🎁 Awarding Pokemon copy to student:", { studentId, pokemonId, source });

    const { error } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source,
        awarded_by: awardedBy
      });

    if (error) {
      console.error("❌ Error awarding Pokemon:", error);
      return false;
    }

    console.log("✅ Pokemon copy awarded successfully to student's collection");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error awarding Pokemon:", error);
    return false;
  }
};

// Get student's Pokemon collection
export const getStudentPokemonCollection = async (studentId: string): Promise<StudentPokemonCollection[]> => {
  try {
    console.log("📦 Fetching student's Pokemon collection:", studentId);

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

    console.log(`✅ Fetched ${data?.length || 0} Pokemon from student's collection`);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching student's collection:", error);
    return [];
  }
};

// Remove Pokemon from student's collection
export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  try {
    console.log("🗑️ Removing Pokemon from student's collection:", collectionId);

    const { error } = await supabase
      .from('student_pokemon_collection')
      .delete()
      .eq('id', collectionId);

    if (error) {
      console.error("❌ Error removing Pokemon:", error);
      return false;
    }

    console.log("✅ Pokemon removed successfully from student's collection");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error removing Pokemon:", error);
    return false;
  }
};

// Mystery ball functionality with shared site-wide pool
export const openMysteryBall = async (studentId: string): Promise<{ success: boolean; pokemon?: PokemonFromPool; coins?: number }> => {
  try {
    console.log("🎲 Opening mystery ball from shared site-wide pool for student:", studentId);

    // 50% chance for Pokemon, 50% chance for coins
    const isPokemon = Math.random() < 0.5;

    if (isPokemon) {
      console.log("🎯 Mystery ball result: Pokemon from shared pool");
      
      // Get a random Pokemon from the shared site-wide pool
      const randomPokemon = await getRandomPokemonFromPool();
      
      if (randomPokemon) {
        // Award a copy of the Pokemon to student (original stays in shared pool)
        const awarded = await awardPokemonToStudent(studentId, randomPokemon.id, 'mystery_ball');
        
        if (awarded) {
          console.log(`✅ Awarded copy of ${randomPokemon.name} to student from shared pool`);
          return { success: true, pokemon: randomPokemon };
        }
      }
    } else {
      // Give coins (1-20 coins)
      const coinAmount = Math.floor(Math.random() * 20) + 1;
      console.log("💰 Mystery ball result: coins -", coinAmount);
      return { success: true, coins: coinAmount };
    }

    return { success: false };
  } catch (error) {
    console.error("❌ Error opening mystery ball:", error);
    return { success: false };
  }
};
