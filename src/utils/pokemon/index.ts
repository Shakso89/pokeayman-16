
// Re-export everything from the unified Pokemon service
export {
  getPokemonPool,
  awardPokemonToStudent,
  getStudentPokemonCollection,
  purchasePokemonFromShop,
  removePokemonFromStudent,
  type Pokemon,
  type StudentPokemonCollection
} from '@/services/pokemonService';

// Legacy exports for backward compatibility - these now use the unified service
export {
  getStudentPokemons,
  assignRandomPokemonToStudent,
  assignSpecificPokemonToStudent,
  awardCoinsToStudent,
  removePokemonFromStudent as removePokemonFromStudentLegacy
} from './studentPokemon';
