
import { getStudentPokemonCollection, awardCoinsToStudent } from "./studentPokemon";
import { Pokemon } from "@/types/pokemon";

// Check if student already owns a Pokémon and award coins if duplicate
export const handlePokemonDuplicate = (studentId: string, pokemon: Pokemon): boolean => {
  const collection = getStudentPokemonCollection(studentId);
  
  if (!collection) {
    return false; // Student doesn't have a collection yet, so no duplicates
  }
  
  // Check if student already owns this Pokémon (by name)
  const hasDuplicate = collection.pokemons.some(ownedPokemon => 
    ownedPokemon.name === pokemon.name
  );
  
  if (hasDuplicate) {
    // Award 3 coins instead of giving duplicate Pokémon
    awardCoinsToStudent(studentId, 3);
    console.log(`Student ${studentId} already owns ${pokemon.name}, awarded 3 coins instead`);
    return true; // Indicates duplicate was handled
  }
  
  return false; // No duplicate found
};
