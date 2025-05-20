
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

// Remove a specific Pokemon from a student and return it to the school pool
export const removePokemonFromStudentAndReturnToPool = (
  studentId: string, 
  pokemonId: string,
  schoolId: string
): boolean => {
  // Get student's collection
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  
  if (studentIndex < 0) {
    console.error("Student not found:", studentId);
    return false;
  }
  
  // Find the Pokemon in the student's collection
  const pokemonIndex = studentPokemons[studentIndex].pokemons.findIndex(p => p.id === pokemonId);
  
  if (pokemonIndex < 0) {
    console.error("Pokemon not found in student collection:", pokemonId);
    return false;
  }
  
  // Remove the Pokemon from the student's collection
  const removedPokemon = studentPokemons[studentIndex].pokemons.splice(pokemonIndex, 1)[0];
  
  // Update student's collection in localStorage
  saveStudentPokemons(studentPokemons);
  
  // Get school pool
  const pokemonPools = getPokemonPools();
  const schoolPoolIndex = pokemonPools.findIndex(pool => pool.schoolId === schoolId);
  
  if (schoolPoolIndex < 0) {
    console.error("School pool not found:", schoolId);
    return false;
  }
  
  // Add the Pokemon back to the school pool
  pokemonPools[schoolPoolIndex].availablePokemons.push(removedPokemon);
  
  // Update pools in localStorage
  savePokemonPools(pokemonPools);
  
  console.log("Pokemon returned to school pool:", removedPokemon.name);
  return true;
};

// Remove coins from a student
export const removeCoinsFromStudent = (studentId: string, amount: number): boolean => {
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  
  if (studentIndex < 0 || studentPokemons[studentIndex].coins < amount) {
    return false;
  }
  
  studentPokemons[studentIndex].coins -= amount;
  
  // Update spent coins counter
  if (studentPokemons[studentIndex].spentCoins !== undefined) {
    studentPokemons[studentIndex].spentCoins += amount;
  } else {
    studentPokemons[studentIndex].spentCoins = amount;
  }
  
  saveStudentPokemons(studentPokemons);
  return true;
};

// Award coins to a student
export const awardCoinsToStudent = (studentId: string, amount: number): void => {
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  
  if (studentIndex >= 0) {
    studentPokemons[studentIndex].coins += amount;
    
    // Initialize spentCoins if it doesn't exist
    if (studentPokemons[studentIndex].spentCoins === undefined) {
      studentPokemons[studentIndex].spentCoins = 0;
    }
  } else {
    studentPokemons.push({
      studentId,
      pokemons: [],
      coins: amount,
      spentCoins: 0
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
