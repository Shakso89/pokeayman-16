import { Pokemon, StudentPokemon } from "@/types/pokemon";
import { getStudentPokemons, saveStudentPokemons } from "./storage";
import { getPokemonPools, savePokemonPools } from "./storage";

// Get student Pokemon collection
export const getStudentPokemonCollection = (studentId: string): StudentPokemon | null => {
  const studentPokemons = getStudentPokemons();
  return studentPokemons.find(sp => sp.studentId === studentId) || null;
};

// Remove a random pokemon from a student
export const removePokemonFromStudent = (studentId: string): boolean => {
  const collection = getStudentPokemonCollection(studentId);
  if (!collection || collection.pokemons.length === 0) {
    return false;
  }

  // Select a random pokemon to remove
  const randomIndex = Math.floor(Math.random() * collection.pokemons.length);
  
  // Remove the pokemon from the student's collection
  collection.pokemons.splice(randomIndex, 1);
  
  // Update localStorage
  const studentCollections = getStudentPokemons();
  const studentIndex = studentCollections.findIndex(item => item.studentId === studentId);
  
  if (studentIndex !== -1) {
    studentCollections[studentIndex].pokemons = collection.pokemons;
    saveStudentPokemons(studentCollections);
    return true;
  }
  
  return false;
};

// Remove coins from a student
export const removeCoinsFromStudent = (studentId: string, amount: number): boolean => {
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  
  if (studentIndex < 0 || studentPokemons[studentIndex].coins < amount) {
    return false;
  }
  
  studentPokemons[studentIndex].coins -= amount;
  saveStudentPokemons(studentPokemons);
  return true;
};

// Award coins to a student
export const awardCoinsToStudent = (studentId: string, amount: number): void => {
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  
  if (studentIndex >= 0) {
    studentPokemons[studentIndex].coins += amount;
  } else {
    studentPokemons.push({
      studentId,
      pokemons: [],
      coins: amount
    });
  }
  
  saveStudentPokemons(studentPokemons);
};

// Assign Pokemon to a student
export const assignPokemonToStudent = (schoolId: string, studentId: string, pokemonId: string): boolean => {
  if (!schoolId || !studentId || !pokemonId) {
    console.error("Missing required parameters:", { schoolId, studentId, pokemonId });
    return false;
  }

  // Get all the pools
  const pools = getPokemonPools();
  const poolIndex = pools.findIndex(p => p.schoolId === schoolId);
  
  if (poolIndex < 0) {
    console.error("School pool not found for:", schoolId);
    return false;
  }
  
  // Find the Pokemon in the school pool
  const pokemonIndex = pools[poolIndex].availablePokemons.findIndex(p => p.id === pokemonId);
  if (pokemonIndex < 0) {
    console.error("Pokemon not found in school pool:", pokemonId);
    return false;
  }
  
  // Remove Pokemon from pool
  const pokemon = pools[poolIndex].availablePokemons.splice(pokemonIndex, 1)[0];
  savePokemonPools(pools);
  
  // Add Pokemon to student
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  
  if (studentIndex >= 0) {
    studentPokemons[studentIndex].pokemons.push(pokemon);
  } else {
    studentPokemons.push({
      studentId,
      pokemons: [pokemon],
      coins: 0
    });
  }
  
  saveStudentPokemons(studentPokemons);
  console.log("Pokemon assigned successfully:", pokemon.name, "to student:", studentId);
  return true;
};

// Assign a random Pokemon from the school pool to a student
export const assignRandomPokemonToStudent = (schoolId: string, studentId: string, specificPokemonId?: string): boolean => {
  if (!schoolId || !studentId) {
    console.error("Missing required parameters:", { schoolId, studentId });
    return false;
  }

  // Get all the pools
  const pools = getPokemonPools();
  const poolIndex = pools.findIndex(p => p.schoolId === schoolId);
  
  if (poolIndex < 0 || pools[poolIndex].availablePokemons.length === 0) {
    console.error("School pool not found or empty for:", schoolId);
    return false;
  }
  
  let pokemonIndex = -1;
  
  // If specificPokemonId is provided, find that pokemon
  if (specificPokemonId) {
    pokemonIndex = pools[poolIndex].availablePokemons.findIndex(p => p.id === specificPokemonId);
    if (pokemonIndex < 0) {
      console.error("Specific Pokemon not found in school pool:", specificPokemonId);
      return false;
    }
  } else {
    // Otherwise select a random pokemon
    pokemonIndex = Math.floor(Math.random() * pools[poolIndex].availablePokemons.length);
  }
  
  // Remove Pokemon from pool
  const pokemon = pools[poolIndex].availablePokemons.splice(pokemonIndex, 1)[0];
  savePokemonPools(pools);
  
  // Add Pokemon to student
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  
  if (studentIndex >= 0) {
    studentPokemons[studentIndex].pokemons.push(pokemon);
  } else {
    studentPokemons.push({
      studentId,
      pokemons: [pokemon],
      coins: 0
    });
  }
  
  saveStudentPokemons(studentPokemons);
  console.log("Pokemon assigned successfully:", pokemon.name, "to student:", studentId);
  return true;
};

// Use a coin to spin the wheel
export const useStudentCoin = (studentId: string, amount: number = 1): boolean => {
  return removeCoinsFromStudent(studentId, amount);
};
