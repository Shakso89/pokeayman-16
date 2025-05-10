
import { PokemonPool, StudentPokemon } from "@/types/pokemon";

// Get Pokemon pools from localStorage or create default ones
export const getPokemonPools = (): PokemonPool[] => {
  const savedPools = localStorage.getItem("pokemonPools");
  if (savedPools) return JSON.parse(savedPools);
  return [];
};

// Save Pokemon pools to localStorage
export const savePokemonPools = (pools: PokemonPool[]) => {
  localStorage.setItem("pokemonPools", JSON.stringify(pools));
};

// Get student Pokemons from localStorage
export const getStudentPokemons = (): StudentPokemon[] => {
  const savedStudentPokemons = localStorage.getItem("studentPokemons");
  if (savedStudentPokemons) return JSON.parse(savedStudentPokemons);
  return [];
};

// Save student Pokemons to localStorage
export const saveStudentPokemons = (studentPokemons: StudentPokemon[]) => {
  localStorage.setItem("studentPokemons", JSON.stringify(studentPokemons));
};
