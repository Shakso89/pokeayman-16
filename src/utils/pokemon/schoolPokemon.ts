
import { Pokemon } from "@/types/pokemon";
import { getRandomType, getRarityForId } from "./types";
import { supabase } from "@/integrations/supabase/client";

// Initialize school Pokemon pool in Supabase
export const initializeSchoolPokemonPool = async (schoolId: string, initialPokemonCount: number = 500): Promise<Pokemon[] | null> => {
  console.log(`Initializing school Pokemon pool for school ${schoolId} with ${initialPokemonCount} Pokemon in Supabase`);
  
  // Create a new pool with random Pokemons
  const pokemonsToInsert: any[] = [];
  const createdPokemons: Pokemon[] = [];
  
  for (let i = 0; i < initialPokemonCount; i++) {
    const pokemonId = Math.floor(1 + Math.random() * 150); // Generate Pokemon ID from 1-150
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

  const { error: insertError } = await supabase
    .from('pokemon_pools')
    .insert(pokemonsToInsert);

  if (insertError) {
    console.error("Error inserting pokemon into pool:", insertError);
    return null;
  }
  
  console.log(`Created new Pokemon pool for school ${schoolId} with ${initialPokemonCount} Pokemons in Supabase.`);
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
  
  const pokemonData: Pokemon[] = data.map(item => ({
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
