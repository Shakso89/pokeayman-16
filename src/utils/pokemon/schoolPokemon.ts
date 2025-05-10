
import { Pokemon, PokemonPool } from "@/types/pokemon";
import { getPokemonPools, savePokemonPools } from "./storage";
import { samplePokemons } from "./sampleData";
import { getRandomType, getRarityForId } from "./types";

// Initialize a Pokemon pool for a school
export const initializeSchoolPokemonPool = (schoolId: string) => {
  // Check if the pool already exists
  const existingPool = getSchoolPokemonPool(schoolId);
  if (existingPool && existingPool.availablePokemons.length > 0) {
    return existingPool;
  }

  // Create a pool of exactly 600 unique Pokemons
  const pokemons: Pokemon[] = [];
  const existingPools = getPokemonPools();

  // First add the sample pokemons (up to 80)
  const samplePokemonsCopy = [...samplePokemons];
  for (let i = 0; i < Math.min(80, samplePokemonsCopy.length); i++) {
    const pokemon = {...samplePokemonsCopy[i]};
    // Ensure unique ID for each Pokemon
    pokemon.id = `pokemon-${schoolId}-${i+1}`;
    pokemons.push(pokemon);
  }

  // Then generate the remaining pokemons to reach exactly 600
  const remainingCount = 600 - pokemons.length;
  for (let i = 1; i <= remainingCount; i++) {
    const index = pokemons.length + i;
    const rarity = getRarityForId(index);
    pokemons.push({
      id: `pokemon-${schoolId}-${index}`,
      name: `Pokemon #${index}`,
      type: getRandomType(),
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${(index % 898) + 1}.png`,
      rarity
    });
  }

  // Check if school pool already exists in the pools array
  const existingPoolIndex = existingPools.findIndex(p => p.schoolId === schoolId);
  
  if (existingPoolIndex >= 0) {
    // Update existing pool
    existingPools[existingPoolIndex].availablePokemons = pokemons;
  } else {
    // Add new pool
    existingPools.push({
      schoolId,
      availablePokemons: pokemons
    });
  }
  
  savePokemonPools(existingPools);
  
  return existingPoolIndex >= 0 ? existingPools[existingPoolIndex] : existingPools[existingPools.length - 1];
};

// Get school Pokemon pool
export const getSchoolPokemonPool = (schoolId: string): PokemonPool | null => {
  const pools = getPokemonPools();
  const pool = pools.find(p => p.schoolId === schoolId);
  
  // If there's no pool but we have a school ID, initialize it
  if (!pool && schoolId) {
    return initializeSchoolPokemonPool(schoolId);
  }
  
  return pool || null;
};

// Get a random Pokemon from the school pool
export const getRandomPokemonFromPool = (schoolId: string): Pokemon | null => {
  const pool = getSchoolPokemonPool(schoolId);
  if (!pool || pool.availablePokemons.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * pool.availablePokemons.length);
  return pool.availablePokemons[randomIndex];
};

// For backward compatibility
export const getClassPokemonPool = getSchoolPokemonPool;
export const initializeClassPokemonPool = initializeSchoolPokemonPool;
