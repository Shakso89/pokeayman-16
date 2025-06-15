import { Pokemon } from "@/types/pokemon";
import { getRandomType, getRarityForId } from "./types";
import { supabase } from "@/integrations/supabase/client";

// Initialize school Pokemon pool in Supabase
export const initializeSchoolPokemonPool = async (schoolId: string, initialPokemonCount: number = 500): Promise<Pokemon[] | null> => {
  console.log(`Initializing school Pokemon pool for school ${schoolId} with ${initialPokemonCount} Pokemon in Supabase`);
  
  // Create a new pool with random Pokemons
  const pokemonsToInsert: any[] = [];
  const createdPokemons: Pokemon[] = [];
  
  // Fetch existing available IDs to avoid true duplicates by (school_id, pokemon_id)
  const { data: existingRows, error: checkErr } = await supabase
    .from('pokemon_pools')
    .select('pokemon_id')
    .eq('school_id', schoolId)
    .eq('available', true);

  // Build a set of already-available IDs
  const availableIds = new Set((existingRows || []).map(r => r.pokemon_id));

  for (let i = 0; pokemonsToInsert.length < initialPokemonCount && i < initialPokemonCount * 2; i++) {
    const pokemonId = Math.floor(1 + Math.random() * 150);
    if (availableIds.has(String(pokemonId))) continue;
    availableIds.add(String(pokemonId));
    const randomPokemon = createRandomPokemon(pokemonId);

    pokemonsToInsert.push({
      school_id: schoolId,
      pokemon_id: randomPokemon.id,
      pokemon_name: randomPokemon.name,
      pokemon_image: randomPokemon.image,
      pokemon_type: randomPokemon.type,
      pokemon_rarity: randomPokemon.rarity,
      pokemon_level: randomPokemon.level,
      available: true,
    });
    createdPokemons.push(randomPokemon);
  }

  if (pokemonsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('pokemon_pools')
      .insert(pokemonsToInsert);

    if (insertError) {
      console.error("Error inserting pokemon into pool:", insertError);
      return null;
    }
    console.log(`Created new Pokemon pool for school ${schoolId} with ${pokemonsToInsert.length} Pokemons`);
  }
  
  return createdPokemons;
};

// Get school Pokemon pool from Supabase
export const getSchoolPokemonPool = async (schoolId: string): Promise<Pokemon[] | null> => {
  console.log(`Getting school Pokemon pool for school ${schoolId} from Supabase`);
  const { data, error } = await supabase
    .from('pokemon_pools')
    .select('*')
    .eq('school_id', schoolId)
    .eq('available', true);

  if (error) {
    console.error("Error fetching school pokemon pool:", error);
    return null;
  }

  if (!data) {
    return [];
  }

  // REMOVE DUPLICATES (only show one Pokemon per id, in UI and logic)
  const seen = new Set<string>();
  const uniqueData = data.filter(item => {
    if (seen.has(item.pokemon_id)) return false;
    seen.add(item.pokemon_id);
    return true;
  });

  const pokemonData: Pokemon[] = uniqueData.map(item => ({
    id: item.pokemon_id,
    name: item.pokemon_name,
    image: item.pokemon_image || '',
    type: item.pokemon_type || '',
    rarity: item.pokemon_rarity as any || 'common',
    level: item.pokemon_level || 1,
  }));

  return pokemonData;
};

// Get random Pokemon from pool
export const getRandomPokemonFromPool = async (schoolId: string): Promise<Pokemon | null> => {
  const pool = await getSchoolPokemonPool(schoolId);
  if (!pool || pool.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

// Initialize class Pokemon pool
export const initializeClassPokemonPool = async (schoolId: string, classId: string, pokemonCount: number = 30): Promise<Pokemon[] | null> => {
  // We're using the school pool structure with the classId as the schoolId
  return initializeSchoolPokemonPool(classId, pokemonCount);
};

// Get class Pokemon pool
export const getClassPokemonPool = async (classId: string): Promise<Pokemon[] | null> => {
  return getSchoolPokemonPool(classId);
};

// Update all school pools to have a specific number of Pokemon
export const updateAllSchoolPoolsTo500 = async (pokemonCount: number = 500): Promise<void> => {
  console.log(`Updating all school pools to ${pokemonCount} Pokemon`);
  
  try {
    // Get all unique school IDs from the database
    const { data: schools, error } = await supabase
      .from('pokemon_pools')
      .select('school_id')
      .neq('school_id', null);

    if (error) {
      console.error("Error fetching schools:", error);
      return;
    }

    const uniqueSchoolIds = [...new Set(schools?.map(s => s.school_id) || [])];
    
    for (const schoolId of uniqueSchoolIds) {
      if (schoolId) {
        const currentPool = await getSchoolPokemonPool(schoolId);
        const currentCount = currentPool?.length || 0;
        
        if (currentCount < pokemonCount) {
          const neededCount = pokemonCount - currentCount;
          await initializeSchoolPokemonPool(schoolId, neededCount);
        }
      }
    }
    
    console.log("All school pools updated successfully");
  } catch (error) {
    console.error("Error updating school pools:", error);
  }
};

// Force update all school pools by clearing and recreating them
export const forceUpdateAllSchoolPools = async (pokemonCount: number = 500): Promise<void> => {
  console.log(`Force updating all school pools to ${pokemonCount} Pokemon`);
  
  try {
    // Get all unique school IDs
    const { data: schools, error } = await supabase
      .from('pokemon_pools')
      .select('school_id')
      .neq('school_id', null);

    if (error) {
      console.error("Error fetching schools:", error);
      return;
    }

    const uniqueSchoolIds = [...new Set(schools?.map(s => s.school_id) || [])];
    
    for (const schoolId of uniqueSchoolIds) {
      if (schoolId) {
        // Clear existing pool for this school
        await supabase
          .from('pokemon_pools')
          .delete()
          .eq('school_id', schoolId);
        
        // Create new pool
        await initializeSchoolPokemonPool(schoolId, pokemonCount);
      }
    }
    
    console.log("All school pools force updated successfully");
  } catch (error) {
    console.error("Error force updating school pools:", error);
  }
};

// Helper function to create a random Pokemon
const createRandomPokemon = (id: number): Pokemon => {
  const type = getRandomType();
  const rarity = getRarityForId(id);
  
  return {
    id: `pokemon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: `Pokemon #${id}`,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    type,
    rarity,
    level: Math.floor(1 + Math.random() * 50) // Random level between 1-50
  };
};

// Get a set of daily wheel pokemons
export const getDailyWheelPokemons = async (schoolId: string, count: number = 6): Promise<Pokemon[]> => {
  const pool = await getSchoolPokemonPool(schoolId);
  const result: Pokemon[] = [];
  
  if (!pool || pool.length === 0) {
    return result;
  }
  
  // Deep copy the availablePokemons to avoid modifying the original array
  const available = [...pool];
  
  // Get random pokemons
  for (let i = 0; i < count; i++) {
    if (available.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * available.length);
    result.push(available[randomIndex]);
    available.splice(randomIndex, 1); // Remove the selected pokemon to avoid duplicates
  }
  
  return result;
};
