
import { Pokemon, StudentPokemon } from "@/types/pokemon";
import { getStudentPokemons, saveStudentPokemons } from "./storage";
import { getPokemonPools, savePokemonPools } from "./storage";
import { handlePokemonDuplicate } from "./duplicateHandler";
import { initializeSchoolPokemonPool, getSchoolPokemonPool } from "./schoolPokemon";

// Get student Pokemon collection
export const getStudentPokemonCollection = (studentId: string): StudentPokemon | null => {
  const studentPokemons = getStudentPokemons();
  return studentPokemons.find(sp => sp.studentId === studentId) || null;
};

// Remove a random pokemon from a student and return it to the school pool
export const removePokemonFromStudent = (studentId: string): { success: boolean; pokemon?: Pokemon } => {
  console.log("Removing random Pokemon from student:", studentId);
  
  const collection = getStudentPokemonCollection(studentId);
  if (!collection || collection.pokemons.length === 0) {
    console.log("No Pokemon found for student:", studentId);
    return { success: false };
  }

  // Select a random pokemon to remove
  const randomIndex = Math.floor(Math.random() * collection.pokemons.length);
  const removedPokemon = collection.pokemons[randomIndex];
  
  // Remove the pokemon from the student's collection
  collection.pokemons.splice(randomIndex, 1);

  // Update studentPokemons in localStorage
  const studentCollections = getStudentPokemons();
  const studentIndex = studentCollections.findIndex(item => item.studentId === studentId);

  if (studentIndex !== -1) {
    studentCollections[studentIndex].pokemons = collection.pokemons;
    saveStudentPokemons(studentCollections);

    // Look up schoolId from student profile or localStorage
    let schoolId: string | undefined;
    if (typeof window !== "undefined") {
      const localStudentProfiles = localStorage.getItem("student_profiles");
      if (localStudentProfiles) {
        try {
          const localProfiles = JSON.parse(localStudentProfiles);
          const lp = localProfiles.find((s: any) => s.id === studentId);
          if (lp?.schoolId || lp?.school_id) schoolId = lp.schoolId || lp.school_id;
        } catch {}
      }
    }
    if (!schoolId) {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const student = students.find((s: any) => s.id === studentId);
      schoolId = student?.schoolId || student?.school_id;
    }

    // Add the removed Pokemon back to the school pool
    if (schoolId) {
      const pokemonPools = getPokemonPools();
      let schoolPoolIndex = pokemonPools.findIndex(pool => pool.schoolId === schoolId);
      
      // Initialize pool if it doesn't exist
      if (schoolPoolIndex < 0) {
        console.log("School pool not found, initializing for school:", schoolId);
        const newPool = initializeSchoolPokemonPool(schoolId, 500);
        if (newPool) {
          pokemonPools.push(newPool);
          schoolPoolIndex = pokemonPools.length - 1;
        }
      }
      
      if (schoolPoolIndex >= 0) {
        pokemonPools[schoolPoolIndex].availablePokemons.push(removedPokemon);
        pokemonPools[schoolPoolIndex].lastUpdated = new Date().toISOString();
        savePokemonPools(pokemonPools);
        console.log("Pokemon returned to school pool:", removedPokemon.name);
      }
    }

    return { success: true, pokemon: removedPokemon };
  }

  return { success: false };
};

// Remove a specific Pokemon from a student and return it to the school pool
export const removePokemonFromStudentAndReturnToPool = (
  studentId: string, 
  pokemonId: string,
  schoolId: string
): boolean => {
  console.log("Removing specific Pokemon from student:", { studentId, pokemonId, schoolId });
  
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
  let schoolPoolIndex = pokemonPools.findIndex(pool => pool.schoolId === schoolId);
  
  // Initialize pool if it doesn't exist
  if (schoolPoolIndex < 0) {
    console.log("School pool not found, initializing for school:", schoolId);
    const newPool = initializeSchoolPokemonPool(schoolId, 500);
    if (newPool) {
      pokemonPools.push(newPool);
      schoolPoolIndex = pokemonPools.length - 1;
    }
  }
  
  if (schoolPoolIndex >= 0) {
    // Add the Pokemon back to the school pool
    pokemonPools[schoolPoolIndex].availablePokemons.push(removedPokemon);
    pokemonPools[schoolPoolIndex].lastUpdated = new Date().toISOString();
    
    // Update pools in localStorage
    savePokemonPools(pokemonPools);
    
    console.log("Pokemon returned to school pool:", removedPokemon.name);
    return true;
  }
  
  console.error("Failed to return Pokemon to school pool");
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

// Assign Pokemon to a student with duplicate handling - REMOVES from pool
export const assignPokemonToStudent = (schoolId: string, studentId: string, pokemonId: string): boolean => {
  if (!schoolId || !studentId || !pokemonId) {
    console.error("Missing required parameters:", { schoolId, studentId, pokemonId });
    return false;
  }

  console.log("Assigning Pokemon to student:", { schoolId, studentId, pokemonId });

  // Get all the pools
  const pools = getPokemonPools();
  let poolIndex = pools.findIndex(p => p.schoolId === schoolId);
  
  // Initialize pool if it doesn't exist
  if (poolIndex < 0) {
    console.log("School pool not found, initializing for school:", schoolId);
    const newPool = initializeSchoolPokemonPool(schoolId, 500);
    if (newPool) {
      pools.push(newPool);
      poolIndex = pools.length - 1;
    } else {
      console.error("Failed to initialize school pool");
      return false;
    }
  }
  
  // Find the Pokemon in the school pool
  const pokemonIndex = pools[poolIndex].availablePokemons.findIndex(p => p.id === pokemonId);
  if (pokemonIndex < 0) {
    console.error("Pokemon not found in school pool:", pokemonId);
    return false;
  }
  
  // Get the Pokemon before removing it from pool
  const pokemon = pools[poolIndex].availablePokemons[pokemonIndex];
  
  // Check for duplicates and handle with coins if found
  const isDuplicate = handlePokemonDuplicate(studentId, pokemon);
  if (isDuplicate) {
    // Don't remove from pool for duplicates, just award coins
    console.log("Duplicate Pokemon found, awarded coins instead");
    return true;
  }
  
  // Remove Pokemon from pool only if not a duplicate
  pools[poolIndex].availablePokemons.splice(pokemonIndex, 1);
  pools[poolIndex].lastUpdated = new Date().toISOString();
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

// Assign a random Pokemon from the school pool to a student - REMOVES from pool
export const assignRandomPokemonToStudent = (schoolId: string, studentId: string, specificPokemonId?: string): { success: boolean; pokemon?: Pokemon } => {
  if (!schoolId || !studentId) {
    console.error("Missing required parameters:", { schoolId, studentId });
    return { success: false };
  }

  console.log("Assigning random Pokemon to student:", { schoolId, studentId });

  // Get all the pools
  const pools = getPokemonPools();
  let poolIndex = pools.findIndex(p => p.schoolId === schoolId);

  // Initialize pool if it doesn't exist
  if (poolIndex < 0) {
    console.log("School pool not found, initializing for school:", schoolId);
    const newPool = initializeSchoolPokemonPool(schoolId, 500);
    if (newPool) {
      pools.push(newPool);
      poolIndex = pools.length - 1;
    } else {
      console.error("Failed to initialize school pool");
      return { success: false };
    }
  }

  if (pools[poolIndex].availablePokemons.length === 0) {
    console.error("School pool is empty for:", schoolId);
    return { success: false };
  }
  
  let pokemonIndex = -1;
  
  // If specificPokemonId is provided, find that pokemon
  if (specificPokemonId) {
    pokemonIndex = pools[poolIndex].availablePokemons.findIndex(p => p.id === specificPokemonId);
    if (pokemonIndex < 0) {
      console.error("Specific Pokemon not found in school pool:", specificPokemonId);
      return { success: false };
    }
  } else {
    // Otherwise select a random pokemon
    pokemonIndex = Math.floor(Math.random() * pools[poolIndex].availablePokemons.length);
  }
  
  // Get the Pokemon before removing it from pool
  const pokemon = pools[poolIndex].availablePokemons[pokemonIndex];
  
  // Check for duplicates and handle with coins if found
  const isDuplicate = handlePokemonDuplicate(studentId, pokemon);
  if (isDuplicate) {
    // Don't remove from pool for duplicates, just award coins
    console.log("Duplicate Pokemon found, awarded coins instead");
    return { success: true, pokemon };
  }
  
  // Remove Pokemon from pool only if not a duplicate
  pools[poolIndex].availablePokemons.splice(pokemonIndex, 1);
  pools[poolIndex].lastUpdated = new Date().toISOString();
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
  return { success: true, pokemon };
};

// Use a coin to spin the wheel
export const useStudentCoin = (studentId: string, amount: number = 1): boolean => {
  return removeCoinsFromStudent(studentId, amount);
};
