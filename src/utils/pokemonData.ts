
// This file is a compatibility layer to ensure existing imports continue to work
// All functionality is now imported from the modular pokemon folder structure

import { 
  getRandomType,
  getRarityForId,
  samplePokemons,
  getPokemonPools,
  savePokemonPools,
  getStudentPokemons,
  saveStudentPokemons,
  initializeSchoolPokemonPool,
  getSchoolPokemonPool,
  removePokemonFromStudent,
  removeCoinsFromStudent,
  awardCoinsToStudent,
  assignPokemonToStudent,
  getStudentPokemonCollection,
  useStudentCoin,
  getRandomPokemonFromPool,
  getClassPokemonPool,
  initializeClassPokemonPool
} from './pokemon';

// Re-export everything to maintain backward compatibility
export {
  getRandomType,
  getRarityForId,
  samplePokemons,
  getPokemonPools,
  savePokemonPools,
  getStudentPokemons,
  saveStudentPokemons,
  initializeSchoolPokemonPool,
  getSchoolPokemonPool,
  removePokemonFromStudent,
  removeCoinsFromStudent,
  awardCoinsToStudent,
  assignPokemonToStudent,
  getStudentPokemonCollection,
  useStudentCoin,
  getRandomPokemonFromPool,
  getClassPokemonPool,
  initializeClassPokemonPool
};
