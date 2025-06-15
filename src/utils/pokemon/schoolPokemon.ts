import { SchoolPoolPokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";

// Initialize school Pokemon pool in Supabase with 300 Pokemon.
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
  const poolSize = Math.min(300, shuffledCatalog.length); // NOT 500!
  const selectedPokemon = shuffledCatalog.slice(0, poolSize);
  const pokemonsToInsert = selectedPokemon.map(pokemon => ({
    school_id: schoolId,
    pokemon_id: pokemon.id,
  }));
  const { error: insertError } = await supabase
    .from('pokemon_pools')
    .insert(pokemonsToInsert);
  if (insertError) return false;
  return true;
};

// Get school pool: just catalog (all available Pokémon can always be awarded, not depleted!)
export const getSchoolPokemonPool = async (schoolId: string): Promise<SchoolPoolPokemon[] | null> => {
  const { data, error } = await supabase
    .from('pokemon_pools')
    .select('id, pokemon_catalog!inner(*)')
    .eq('school_id', schoolId);

  if (error || !data) return [];

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
      if (item.pokemon_catalog.power_stats) {
        pokemon.powerStats = item.pokemon_catalog.power_stats;
      }
      return pokemon;
    })
    .filter((p): p is SchoolPoolPokemon => p !== null);

  return pool;
};
