
import { getStudentPokemonCollection } from "@/services/unifiedPokemonService";
import { awardCoinsToStudent } from "./studentPokemon";
import { Pokemon } from "@/types/pokemon";

// Check if student already owns a Pokémon and award coins if duplicate
export const handlePokemonDuplicate = async (studentId: string, pokemon: Pokemon): Promise<boolean> => {
  const collections = await getStudentPokemonCollection(studentId);
  
  if (!collections || collections.length === 0) {
    return false; // Student doesn't have a collection yet, so no duplicates
  }
  
  // Check if student already owns this Pokémon (by ID or name)
  const hasDuplicate = collections.some(collection => {
    const pokemonData = collection.pokemon_pool;
    return pokemonData && (
      pokemonData.id === pokemon.id || 
      pokemonData.name === pokemon.name
    );
  });
  
  if (hasDuplicate) {
    // Award 3 coins instead of giving duplicate Pokémon
    await awardCoinsToStudent(studentId, 3, "Duplicate Pokemon compensation");
    console.log(`Student ${studentId} already owns ${pokemon.name}, awarded 3 coins instead`);
    return true; // Indicates duplicate was handled
  }
  
  return false; // No duplicate found
};
