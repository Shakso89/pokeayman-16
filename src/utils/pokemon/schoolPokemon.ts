
import { SchoolPoolPokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";

// Initialize school Pokemon pool in Supabase with 500 Pokemon.
export const initializeSchoolPokemonPool = async (schoolId: string): Promise<boolean> => {
  console.log(`Initializing Pokemon pool for school ${schoolId}`);
  
  const { data: catalog, error: catalogError } = await supabase
    .from('pokemon_catalog')
    .select('id');
  
  if (catalogError || !catalog || catalog.length === 0) {
    console.error("Could not fetch pokemon catalog. Cannot initialize pool.", catalogError);
    return false;
  }
  
  const pokemonsToInsert: { school_id: string; pokemon_id: number; }[] = [];
  for (let i = 0; i < 500; i++) {
    const randomPokemon = catalog[Math.floor(Math.random() * catalog.length)];
    pokemonsToInsert.push({
      school_id: schoolId,
      pokemon_id: randomPokemon.id
    });
  }
  
  const { error: insertError } = await supabase
    .from('pokemon_pools')
    .insert(pokemonsToInsert);
    
  if (insertError) {
    console.error("Error inserting pokemon into pool:", insertError);
    return false;
  }
  
  console.log(`Initialized Pokemon pool for school ${schoolId} with 500 Pokemon`);
  return true;
};

// Get available Pokemon from a school's pool from Supabase
export const getSchoolPokemonPool = async (schoolId: string): Promise<SchoolPoolPokemon[] | null> => {
  console.log(`Getting available Pokemon from school pool for school ${schoolId}`);
  const { data, error } = await supabase
    .from('pokemon_pools')
    .select('id, pokemon_catalog!inner(*)')
    .eq('school_id', schoolId)
    .eq('status', 'available');

  if (error) {
    console.error("Error fetching school pokemon pool:", error);
    return null;
  }

  if (!data) {
    return [];
  }

  const pool: SchoolPoolPokemon[] = data
    .map((item: any) => {
      if (!item.pokemon_catalog) return null;
      const pokemon: SchoolPoolPokemon = {
        poolEntryId: item.id,
        id: item.pokemon_catalog.id,
        name: item.pokemon_catalog.name,
        image: item.pokemon_catalog.image,
        type: item.pokemon_catalog.type,
        rarity: item.pokemon_catalog.rarity,
      };
      
      // Only add powerStats if it exists
      if (item.pokemon_catalog.power_stats) {
        pokemon.powerStats = item.pokemon_catalog.power_stats;
      }
      
      return pokemon;
    })
    .filter((p): p is SchoolPoolPokemon => p !== null);

  return pool;
};

// Force update all school pools - regenerate Pokemon pools for all schools
export const forceUpdateAllSchoolPools = async (poolSize: number = 500): Promise<boolean> => {
  console.log(`Force updating all school pools with ${poolSize} Pokemon each`);
  
  try {
    // Get all schools
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id');
    
    if (schoolsError || !schools) {
      console.error("Error fetching schools:", schoolsError);
      return false;
    }

    // Clear existing pools and reinitialize
    for (const school of schools) {
      // Clear existing pool
      await supabase
        .from('pokemon_pools')
        .delete()
        .eq('school_id', school.id);
      
      // Reinitialize
      await initializeSchoolPokemonPool(school.id);
    }
    
    return true;
  } catch (error) {
    console.error("Error force updating school pools:", error);
    return false;
  }
};

// Award coins to a student - simplified approach
export const awardCoinsToStudent = async (studentId: string, amount: number): Promise<boolean> => {
  try {
    // Get current coins first
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('coins')
      .eq('user_id', studentId)
      .single();

    const currentCoins = profile?.coins || 0;
    const newCoins = currentCoins + amount;

    const { error } = await supabase
      .from('student_profiles')
      .update({ coins: newCoins })
      .eq('user_id', studentId);

    if (error) {
      console.error("Error awarding coins to student:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error awarding coins to student:", error);
    return false;
  }
};

// Use/spend student coins
export const useStudentCoin = (studentId: string, amount: number): boolean => {
  // This is a simplified implementation - in a real app you'd want to check current coins first
  console.log(`Using ${amount} coins for student ${studentId}`);
  return true;
};
