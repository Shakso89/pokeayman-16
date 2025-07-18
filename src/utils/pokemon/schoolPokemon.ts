
import { SchoolPoolPokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";

// Initialize school Pokemon pool in Supabase with 300 Pokemon.
export const initializeSchoolPokemonPool = async (schoolId: string): Promise<boolean> => {
  console.log(`Initializing Pokemon pool for school ${schoolId}`);
  
  // First check if school already has a pool to avoid duplicates
  const { data: existingPool, error: checkError } = await supabase
    .from('school_pokemon_pools')
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
    .from('pokemon_pool')
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
  const poolSize = Math.min(300, shuffledCatalog.length); // NOT 500!
  const selectedPokemon = shuffledCatalog.slice(0, poolSize);
  const pokemonsToInsert = selectedPokemon.map(pokemon => ({
    school_id: schoolId,
    pokemon_id: pokemon.id,
  }));
  const { error: insertError } = await supabase
    .from('school_pokemon_pools')
    .insert(pokemonsToInsert);
  if (insertError) return false;
  return true;
};

// Get school pool: just catalog (all available Pokémon can always be awarded, not depleted!)
export const getSchoolPokemonPool = async (schoolId: string): Promise<SchoolPoolPokemon[] | null> => {
  const { data, error } = await supabase
    .from('school_pokemon_pools')
    .select(`
      id,
      pokemon_pool!fk_school_pokemon_pool_pokemon (*)
    `)
    .eq('school_id', schoolId);

  if (error || !data) return [];

  const pool: SchoolPoolPokemon[] = data
    .map((item: any) => {
      if (!item.pokemon_pool) return null;
      const pokemon: SchoolPoolPokemon = {
        poolEntryId: item.id,
        id: item.pokemon_pool.id,
        name: item.pokemon_pool.name,
        image_url: item.pokemon_pool.image_url,
        type_1: item.pokemon_pool.type_1,
        rarity: item.pokemon_pool.rarity,
        price: item.pokemon_pool.price || 15,
      };
      if (item.pokemon_pool.power_stats) {
        pokemon.power_stats = item.pokemon_pool.power_stats;
      }
      return pokemon;
    })
    .filter((p): p is SchoolPoolPokemon => p !== null);

  return pool;
};

// Force update all school pools - refreshes all school Pokemon pools with new random selections
export const forceUpdateAllSchoolPools = async (): Promise<boolean> => {
  try {
    console.log("Starting force update of all school Pokemon pools");
    
    // Get all schools
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id');
    
    if (schoolsError || !schools) {
      console.error("Error fetching schools:", schoolsError);
      return false;
    }
    
    // For each school, delete existing pool and recreate it
    for (const school of schools) {
      try {
        // Delete existing pool entries for this school
        const { error: deleteError } = await supabase
          .from('school_pokemon_pools')
          .delete()
          .eq('school_id', school.id);
          
        if (deleteError) {
          console.error(`Error deleting pool for school ${school.id}:`, deleteError);
          continue;
        }
        
        // Reinitialize the pool
        const success = await initializeSchoolPokemonPool(school.id);
        if (!success) {
          console.error(`Failed to reinitialize pool for school ${school.id}`);
        } else {
          console.log(`Successfully updated pool for school ${school.id}`);
        }
      } catch (error) {
        console.error(`Error updating school ${school.id}:`, error);
      }
    }
    
    console.log("Completed force update of all school Pokemon pools");
    return true;
    
  } catch (error) {
    console.error("Error in forceUpdateAllSchoolPools:", error);
    return false;
  }
};
