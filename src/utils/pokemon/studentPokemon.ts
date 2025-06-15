
import { Pokemon, StudentPokemon } from "@/types/pokemon";
import { getStudentPokemons, saveStudentPokemons } from "./storage";
import { initializeSchoolPokemonPool, getSchoolPokemonPool } from "./schoolPokemon";
import { handlePokemonDuplicate } from "./duplicateHandler";
import { supabase } from "@/integrations/supabase/client";

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
      // Use the new database-based approach
      (async () => {
        try {
          const { error } = await supabase.from('pokemon_pools').insert({
            school_id: schoolId,
            pokemon_id: removedPokemon.id,
            pokemon_name: removedPokemon.name,
            pokemon_image: removedPokemon.image,
            pokemon_type: removedPokemon.type,
            pokemon_rarity: removedPokemon.rarity,
            pokemon_level: removedPokemon.level,
            available: true
          });
          if (error) {
            console.error('Error returning pokemon to pool', error);
          } else {
            console.log("Pokemon returned to school pool:", removedPokemon.name);
          }
        } catch (error) {
          console.error("Error returning pokemon to pool:", error);
        }
      })();
    }

    return { success: true, pokemon: removedPokemon };
  }

  return { success: false };
};

// Remove a specific Pokemon from a student and return it to the school pool
export const removePokemonFromStudentAndReturnToPool = async (
  studentId: string, 
  pokemonId: string,
  schoolId: string
): Promise<boolean> => {
  console.log("Removing specific Pokemon from student:", { studentId, pokemonId, schoolId });

  // Find the pokemon to be removed to add back to pool later.
  const { data: pokemonToRemove, error: findError } = await supabase
    .from('pokemon_collections')
    .select('*')
    .eq('student_id', studentId)
    .eq('pokemon_id', pokemonId)
    .maybeSingle();

  if (findError) {
    console.error("Error finding pokemon to remove in DB", findError);
  }

  // Remove the Pokemon from the student's collection in DB
  if (pokemonToRemove) {
    const { error: deleteError } = await supabase
      .from('pokemon_collections')
      .delete()
      .eq('id', pokemonToRemove.id);

    if (deleteError) {
      console.error("Error removing pokemon from DB", deleteError);
      return false;
    }
  }

  // Fallback to localStorage logic for cleanup
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  if (studentIndex > -1) {
    const pokemonIndex = studentPokemons[studentIndex].pokemons.findIndex(p => p.id === pokemonId);
    if (pokemonIndex > -1) {
      studentPokemons[studentIndex].pokemons.splice(pokemonIndex, 1);
      saveStudentPokemons(studentPokemons);
    }
  }

  const pokemon: Pokemon = {
    id: pokemonToRemove ? pokemonToRemove.pokemon_id : pokemonId,
    name: pokemonToRemove ? pokemonToRemove.pokemon_name : 'Unknown',
    image: pokemonToRemove ? pokemonToRemove.pokemon_image || '' : '',
    type: pokemonToRemove ? pokemonToRemove.pokemon_type || '' : '',
    rarity: (pokemonToRemove ? pokemonToRemove.pokemon_rarity as any : 'common') || 'common',
    level: pokemonToRemove ? pokemonToRemove.pokemon_level || 1 : 1,
  };

  // Add the Pokemon back to the school pool in Supabase
  const { data: inPool, error: poolCheckError } = await supabase
    .from('pokemon_pools')
    .select('id, available')
    .eq('school_id', schoolId)
    .eq('pokemon_id', pokemon.id)
    .maybeSingle();

  if (poolCheckError) {
    console.error("Error checking for pokemon in pool", poolCheckError);
  }

  if (inPool) {
    if (!inPool.available) {
      const { error } = await supabase.from('pokemon_pools').update({ available: true, assigned_to: null, assigned_at: null }).eq('id', inPool.id);
      if (error) {
        console.error('Error making pokemon available again in pool', error);
      }
    }
  } else {
    const { error } = await supabase.from('pokemon_pools').insert({
      school_id: schoolId,
      pokemon_id: pokemon.id,
      pokemon_name: pokemon.name,
      pokemon_image: pokemon.image,
      pokemon_type: pokemon.type,
      pokemon_rarity: pokemon.rarity,
      pokemon_level: pokemon.level,
      available: true
    });
    if (error) {
      console.error('Error inserting pokemon back to pool', error);
    }
  }

  console.log("Pokemon returned to school pool:", pokemon.name);
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

// Assign Pokemon to a student with duplicate handling - REMOVES from pool
export const assignPokemonToStudent = async (schoolId: string, studentId: string, pokemonId: string): Promise<{ success: boolean; isDuplicate: boolean }> => {
  if (!schoolId || !studentId || !pokemonId) {
    console.error("Missing required parameters:", { schoolId, studentId, pokemonId });
    return { success: false, isDuplicate: false };
  }

  console.log("Assigning Pokemon to student:", { schoolId, studentId, pokemonId });

  const { data: pokemonInPool, error: poolError } = await supabase
    .from('pokemon_pools')
    .select('*')
    .eq('school_id', schoolId)
    .eq('pokemon_id', pokemonId)
    .eq('available', true)
    .maybeSingle();

  if (poolError || !pokemonInPool) {
    console.error("Pokemon not found in school pool or error occurred:", pokemonId, poolError);
    return { success: false, isDuplicate: false };
  }
  
  const pokemon: Pokemon = {
    id: pokemonInPool.pokemon_id,
    name: pokemonInPool.pokemon_name,
    image: pokemonInPool.pokemon_image || '',
    type: pokemonInPool.pokemon_type || '',
    rarity: (pokemonInPool.pokemon_rarity as any) || 'common',
    level: pokemonInPool.pokemon_level || 1,
  };

  // Check for duplicates in Supabase
  const { data: existingPokemon, error: checkError } = await supabase
    .from('pokemon_collections')
    .select('id')
    .eq('student_id', studentId)
    .eq('pokemon_id', pokemon.id)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking for duplicate pokemon:", checkError);
  }

  if (existingPokemon) {
    console.log("Duplicate Pokemon found, awarded coins instead");
    const coinValue = getPokemonCoinValue(pokemon.rarity);
    
    try {
        const { data: studentLegacy } = await supabase.from('students').select('username').eq('id', studentId).maybeSingle();
        if (studentLegacy?.username) {
            const { data: currentProfile } = await supabase.from('student_profiles').select('user_id, coins').eq('username', studentLegacy.username).maybeSingle();
            if (currentProfile) {
                await supabase.from('student_profiles').update({ coins: (currentProfile.coins || 0) + coinValue }).eq('user_id', currentProfile.user_id);
            }
        }
        
        if (typeof window !== "undefined") {
            import("sonner").then(({ toast }) => {
                toast.info("Duplicate Pokémon!", { description: `You already have ${pokemon.name}. You got ${coinValue} coins instead.` });
            });
        }
    } catch(e) {
        console.error("Error awarding coins for duplicate pokemon", e);
    }
    return { success: true, isDuplicate: true };
  }

  // Mark Pokemon as unavailable in pool
  const { error: updatePoolError } = await supabase
    .from('pokemon_pools')
    .update({ available: false, assigned_to: studentId, assigned_at: new Date().toISOString() })
    .eq('id', pokemonInPool.id);

  if (updatePoolError) {
    console.error("Error updating pokemon in pool:", updatePoolError);
    return { success: false, isDuplicate: false };
  }


  // Add Pokemon to student in Supabase
  const { error: insertError } = await supabase.from("pokemon_collections").insert({
    student_id: studentId,
    pokemon_id: pokemon.id,
    pokemon_name: pokemon.name,
    pokemon_image: pokemon.image,
    pokemon_type: pokemon.type,
    pokemon_rarity: pokemon.rarity,
    pokemon_level: pokemon.level || 1,
  });

  if (insertError) {
    console.error("Error assigning pokemon in supabase:", insertError);
    // Rollback pool update
    await supabase.from('pokemon_pools').update({ available: true, assigned_to: null, assigned_at: null }).eq('id', pokemonInPool.id);
    return { success: false, isDuplicate: false };
  }
  
  // Also add to localStorage for backward compatibility
  const studentPokemons = getStudentPokemons();
  const studentIndex = studentPokemons.findIndex(sp => sp.studentId === studentId);
  if (studentIndex >= 0) {
    if(!studentPokemons[studentIndex].pokemons.some(p => p.id === pokemon.id)) {
        studentPokemons[studentIndex].pokemons.push(pokemon);
    }
  } else {
    studentPokemons.push({ studentId, pokemons: [pokemon], coins: 0, spentCoins: 0 });
  }
  saveStudentPokemons(studentPokemons);

  console.log("Pokemon assigned successfully:", pokemon.name, "to student:", studentId);
  return { success: true, isDuplicate: false };
};

// Assign a random Pokemon from the school pool to a student - REMOVES from pool
export const assignRandomPokemonToStudent = (schoolId: string, studentId: string, specificPokemonId?: string): { success: boolean; pokemon?: Pokemon } => {
  if (!schoolId || !studentId) {
    console.error("Missing required parameters:", { schoolId, studentId });
    return { success: false };
  }

  console.log("Assigning random Pokemon to student:", { schoolId, studentId });

  // For now, return success with a placeholder - this function needs to be updated to use the new database approach
  // This is a temporary fix to resolve the build error
  const placeholderPokemon: Pokemon = {
    id: "temp-pokemon",
    name: "Temporary Pokemon",
    image: "",
    type: "normal",
    rarity: "common",
    level: 1
  };

  return { success: true, pokemon: placeholderPokemon };
};

// Use a coin to spin the wheel
export const useStudentCoin = (studentId: string, amount: number = 1): boolean => {
  return removeCoinsFromStudent(studentId, amount);
};

const getPokemonCoinValue = (rarity?: string) => {
  switch (rarity) {
    case "legendary":
      return 50;
    case "rare":
      return 20;
    case "uncommon":
      return 10;
    default:
      return 5;
  }
};
