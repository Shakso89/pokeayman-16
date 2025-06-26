
// Re-export everything from the unified Pokemon service
export {
  getPokemonCatalog as getPokemonPool,
  awardPokemonToStudent,
  getStudentPokemonCollection,
  purchasePokemonFromShop,
  removePokemonFromStudent,
  type PokemonCatalogItem as Pokemon,
  type StudentPokemonCollectionItem as StudentPokemonCollection
} from '@/services/pokemonService';

// Legacy exports for backward compatibility - these now use the unified service
export {
  getStudentPokemons,
  assignRandomPokemonToStudent,
  assignSpecificPokemonToStudent,
  awardCoinsToStudent,
  removePokemonFromStudent as removePokemonFromStudentLegacy
} from './studentPokemon';
