
import { supabase } from "@/integrations/supabase/client";

export interface Pokemon {
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
  pokemon?: Pokemon;
}

// Get all Pokemon from the unified pool
export const getPokemonPool = async (): Promise<Pokemon[]> => {
  try {
    console.log("🌍 Fetching unified Pokemon pool...");
    
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .order('name');

    if (error) {
      console.error("❌ Error fetching Pokemon pool:", error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} Pokemon from unified pool`);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokemon pool:", error);
    return [];
  }
};

// Get random Pokemon from unified pool
export const getRandomPokemonFromPool = async (): Promise<Pokemon | null> => {
  try {
    console.log("🎲 Getting random Pokemon from unified pool...");
    
    const { count, error: countError } = await supabase
      .from('pokemon_pool')
      .select('*', { count: 'exact', head: true });

    if (countError || !count) {
      console.error("❌ Error getting Pokemon count:", countError);
      return null;
    }

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

    // Validate inputs
    if (!studentId || !pokemonId) {
      console.error("❌ Missing required parameters:", { studentId, pokemonId });
      return false;
    }

    // Verify Pokemon exists in unified pool
    const { data: pokemonExists, error: checkError } = await supabase
      .from('pokemon_pool')
      .select('id, name')
      .eq('id', pokemonId)
      .single();

    if (checkError || !pokemonExists) {
      console.error("❌ Pokemon not found in unified pool:", { pokemonId, error: checkError });
      return false;
    }

    console.log("✅ Pokemon verified in unified pool:", pokemonExists.name);

    // Get the actual student ID from the students table if we have a username
    let actualStudentId = studentId;
    
    // Check if we need to look up the student by username
    if (studentId && !studentId.includes('-')) {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('username', studentId)
        .single();
      
      if (studentData && !studentError) {
        actualStudentId = studentData.id;
        console.log("✅ Found student ID by username:", actualStudentId);
      }
    }

    // Insert into student's collection
    const { data: insertData, error } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: actualStudentId,
        pokemon_id: pokemonId,
        source,
        awarded_by: awardedBy
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error awarding Pokemon:", error);
      console.error("❌ Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    console.log("✅ Pokemon copy awarded successfully to student's collection:", insertData);
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

    if (!studentId) {
      console.error("❌ No student ID provided");
      return [];
    }

    // Get the actual student ID if we have a username
    let actualStudentId = studentId;
    
    if (studentId && !studentId.includes('-')) {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('username', studentId)
        .single();
      
      if (studentData && !studentError) {
        actualStudentId = studentData.id;
      }
    }

    const { data, error } = await supabase
      .from('student_pokemon_collection')
      .select(`
        *,
        pokemon:pokemon_pool(*)
      `)
      .eq('student_id', actualStudentId)
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

// Mystery ball functionality with unified pool
export const openMysteryBall = async (studentId: string): Promise<{ success: boolean; pokemon?: Pokemon; coins?: number }> => {
  try {
    console.log("🎲 Opening mystery ball from unified pool for student:", studentId);

    if (!studentId) {
      console.error("❌ No student ID provided for mystery ball");
      return { success: false };
    }

    // 50% chance for Pokemon, 50% chance for coins
    const isPokemon = Math.random() < 0.5;

    if (isPokemon) {
      console.log("🎯 Mystery ball result: Pokemon from unified pool");
      
      const randomPokemon = await getRandomPokemonFromPool();
      
      if (randomPokemon) {
        const awarded = await awardPokemonToStudent(studentId, randomPokemon.id, 'mystery_ball');
        
        if (awarded) {
          console.log(`✅ Awarded copy of ${randomPokemon.name} to student from unified pool`);
          return { success: true, pokemon: randomPokemon };
        } else {
          console.error("❌ Failed to award Pokemon from mystery ball");
        }
      } else {
        console.error("❌ Failed to get random Pokemon for mystery ball");
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

// Purchase Pokemon from shop (creates a copy in student's collection)
export const purchasePokemonFromShop = async (
  studentId: string,
  pokemonId: string,
  price: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("🛒 Purchasing Pokemon copy from unified pool:", { studentId, pokemonId, price });

    if (!studentId || !pokemonId) {
      return { success: false, error: "Missing required parameters" };
    }

    const success = await awardPokemonToStudent(studentId, pokemonId, 'shop_purchase');

    if (!success) {
      return { success: false, error: "Failed to award Pokemon copy to collection" };
    }

    console.log("✅ Pokemon copy purchased successfully from unified pool");
    return { success: true };
  } catch (error) {
    console.error("❌ Error purchasing Pokemon:", error);
    return { success: false, error: "Unexpected error occurred during purchase" };
  }
};
