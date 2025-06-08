
import { Pokemon, PokemonPool } from "@/types/pokemon";
import { getRandomType, getRarityForId } from "./types";
import { getPokemonPools, savePokemonPools } from "./storage";

// Initialize school Pokemon pool
export const initializeSchoolPokemonPool = (schoolId: string, initialPokemonCount: number = 500): PokemonPool | null => {
  console.log(`Initializing school Pokemon pool for school ${schoolId} with ${initialPokemonCount} Pokemon`);
  
  // Check if pool already exists
  const existingPools = getPokemonPools();
  const existingPool = existingPools.find(pool => pool.schoolId === schoolId);
  
  if (existingPool) {
    console.log(`Pool for school ${schoolId} already exists with ${existingPool.availablePokemons.length} Pokemon`);
    return existingPool;
  }

  // Create a new pool with random Pokemons
  const pokemons: Pokemon[] = [];
  
  for (let i = 0; i < initialPokemonCount; i++) {
    const pokemonId = Math.floor(1 + Math.random() * 150); // Generate Pokemon ID from 1-150
    pokemons.push(createRandomPokemon(pokemonId));
  }

  // Add to pools and save
  const newPool: PokemonPool = {
    schoolId,
    availablePokemons: pokemons,
    lastUpdated: new Date().toISOString()
  };
  
  existingPools.push(newPool);
  savePokemonPools(existingPools);
  
  console.log(`Created new Pokemon pool for school ${schoolId} with ${initialPokemonCount} Pokemons`);
  return newPool;
};

// Get school Pokemon pool
export const getSchoolPokemonPool = (schoolId: string): PokemonPool | null => {
  console.log(`Getting school Pokemon pool for school ${schoolId}`);
  const pools = getPokemonPools();
  const pool = pools.find(pool => pool.schoolId === schoolId) || null;
  console.log(`Found pool:`, pool ? `${pool.availablePokemons.length} Pokemon` : 'null');
  return pool;
};

// Update all school pools to have 500 Pokemon each
export const updateAllSchoolPoolsTo500 = (): void => {
  const pools = getPokemonPools();
  let updated = false;
  
  for (const pool of pools) {
    const currentCount = pool.availablePokemons.length;
    if (currentCount < 500) {
      const additionalNeeded = 500 - currentCount;
      
      for (let i = 0; i < additionalNeeded; i++) {
        const pokemonId = Math.floor(1 + Math.random() * 150);
        pool.availablePokemons.push(createRandomPokemon(pokemonId));
      }
      
      pool.lastUpdated = new Date().toISOString();
      updated = true;
      console.log(`Updated pool for school ${pool.schoolId} from ${currentCount} to ${pool.availablePokemons.length} Pokemon`);
    }
  }
  
  if (updated) {
    savePokemonPools(pools);
    console.log("Updated school pools to have at least 500 Pokemon each");
  }
};

// Force update all school pools
export const forceUpdateAllSchoolPools = (pokemonCount: number = 500): void => {
  const pools = getPokemonPools();
  
  for (const pool of pools) {
    // Clear existing Pokemon
    pool.availablePokemons = [];
    
    // Add new random Pokemon
    for (let i = 0; i < pokemonCount; i++) {
      const pokemonId = Math.floor(1 + Math.random() * 150);
      pool.availablePokemons.push(createRandomPokemon(pokemonId));
    }
    
    pool.lastUpdated = new Date().toISOString();
  }
  
  savePokemonPools(pools);
  console.log(`Force updated all school pools with ${pokemonCount} new Pokemon each`);
};

// Get random Pokemon from pool
export const getRandomPokemonFromPool = (schoolId: string): Pokemon | null => {
  const pool = getSchoolPokemonPool(schoolId);
  if (!pool || pool.availablePokemons.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * pool.availablePokemons.length);
  return pool.availablePokemons[randomIndex];
};

// Initialize class Pokemon pool
export const initializeClassPokemonPool = (schoolId: string, classId: string, pokemonCount: number = 30): PokemonPool | null => {
  // We're using the school pool structure with the classId as the schoolId
  return initializeSchoolPokemonPool(classId, pokemonCount);
};

// Get class Pokemon pool
export const getClassPokemonPool = (classId: string): PokemonPool | null => {
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
export const getDailyWheelPokemons = (schoolId: string, count: number = 6): Pokemon[] => {
  const pool = getSchoolPokemonPool(schoolId);
  const result: Pokemon[] = [];
  
  if (!pool || pool.availablePokemons.length === 0) {
    return result;
  }
  
  // Deep copy the availablePokemons to avoid modifying the original array
  const available = [...pool.availablePokemons];
  
  // Get random pokemons
  for (let i = 0; i < count; i++) {
    if (available.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * available.length);
    result.push(available[randomIndex]);
    available.splice(randomIndex, 1); // Remove the selected pokemon to avoid duplicates
  }
  
  return result;
};
