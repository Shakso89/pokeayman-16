// Re-export everything from the unified Pokemon service
export {
  getPokemonPool,
  getRandomPokemonFromPool,
  awardPokemonToStudent,
  getStudentPokemonCollection,
  openMysteryBall,
  purchasePokemonFromShop,
  type Pokemon,
  type StudentPokemonCollection
} from '@/services/pokemonService';

// Keep student-specific functions from studentPokemon.ts that are still needed
export {
  getStudentPokemons,
  assignRandomPokemonToStudent,
  assignSpecificPokemonToStudent,
  awardCoinsToStudent,
  removePokemonFromStudent
} from './studentPokemon';
