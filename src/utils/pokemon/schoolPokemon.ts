
import { SchoolPoolPokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";

// Initialize school Pokemon pool in Supabase with 500 Pokemon.
export const initializeSchoolPokemonPool = async (schoolId: string): Promise<boolean> => {
  console.log(`Initializing Pokemon pool for school ${schoolId}`);
  
  // First check if school already has a pool to avoid duplicates
  const { data: existingPool, error: checkError } = await supabase
    .from('pokemon_pools')
    .select('id')
    .eq('school_id', schoolId)
    .limit(1);
  
  if (checkError) {
    console.error("Error checking existing pool:", checkError);
    return false;
  }
  
  if (existingPool && existingPool.length > 0) {
    console.log(`School ${schoolId} already has a Pokemon pool, skipping initialization`);
    return true;
  }
  
  const { data: catalog, error: catalogError } = await supabase
    .from('pokemon_catalog')
    .select('id');
  
  if (catalogError || !catalog || catalog.length === 0) {
    console.error("Could not fetch pokemon catalog. Cannot initialize pool.", catalogError);
    return false;
  }
  
  // Shuffle the catalog to get a random order of unique Pokemon
  const shuffledCatalog = [...catalog];
  for (let i = shuffledCatalog.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCatalog[i], shuffledCatalog[j]] = [shuffledCatalog[j], shuffledCatalog[i]];
  }

  // Take the first 500 unique pokemon, or all if the catalog is smaller
  const poolSize = Math.min(500, shuffledCatalog.length);
  const selectedPokemon = shuffledCatalog.slice(0, poolSize);

  const pokemonsToInsert = selectedPokemon.map(pokemon => ({
    school_id: schoolId,
    pokemon_id: pokemon.id,
  }));
  
  const { error: insertError } = await supabase
    .from('pokemon_pools')
    .insert(pokemonsToInsert);
    
  if (insertError) {
    console.error("Error inserting pokemon into pool:", insertError);
    return false;
  }
  
  console.log(`Initialized Pokemon pool for school ${schoolId} with ${poolSize} unique Pokemon`);
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
export const forceUpdateAllSchoolPools = async (): Promise<boolean> => {
  console.log(`Force updating all school pools`);
  
  try {
    // Get all schools
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id');
    
    if (schoolsError || !schools) {
      console.error("Error fetching schools:", schoolsError);
      return false;
    }

    // Get all available Pokemon from catalog
    const { data: catalog, error: catalogError } = await supabase
      .from('pokemon_catalog')
      .select('id');
    
    if (catalogError || !catalog || catalog.length === 0) {
      console.error("Could not fetch pokemon catalog for pool refresh.", catalogError);
      return false;
    }

    // Clear existing pools and reinitialize with fresh random selections
    for (const school of schools) {
      // Clear existing pool
      await supabase
        .from('pokemon_pools')
        .delete()
        .eq('school_id', school.id);
      
      // Create a new random selection of 500 Pokemon for this school
      const shuffledCatalog = [...catalog];
      for (let i = shuffledCatalog.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCatalog[i], shuffledCatalog[j]] = [shuffledCatalog[j], shuffledCatalog[i]];
      }

      const poolSize = Math.min(500, shuffledCatalog.length);
      const selectedPokemon = shuffledCatalog.slice(0, poolSize);

      const pokemonsToInsert = selectedPokemon.map(pokemon => ({
        school_id: school.id,
        pokemon_id: pokemon.id,
        status: 'available'
      }));
      
      const { error: insertError } = await supabase
        .from('pokemon_pools')
        .insert(pokemonsToInsert);
        
      if (insertError) {
        console.error(`Error reinitializing pool for school ${school.id}:`, insertError);
        continue; // Continue with other schools even if one fails
      }
      
      console.log(`Reinitialized school ${school.id} with ${poolSize} new Pokemon`);
    }
    
    console.log(`Successfully refreshed all school pools with 500 unique Pokemon each`);
    return true;
  } catch (error) {
    console.error("Error force updating school pools:", error);
    return false;
  }
};
