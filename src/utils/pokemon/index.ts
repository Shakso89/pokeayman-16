
import {
  removePokemonFromStudent,
  removePokemonFromStudentAndReturnToPool,
  removeCoinsFromStudent,
  awardCoinsToStudent,
  assignPokemonToStudent,
  assignRandomPokemonToStudent,
  useStudentCoin,
  getStudentPokemonCollection
} from './studentPokemon';

import {
  initializeSchoolPokemonPool,
  getSchoolPokemonPool,
  updateAllSchoolPoolsTo500,
  getRandomPokemonFromPool,
  initializeClassPokemonPool,
  getClassPokemonPool,
  getDailyWheelPokemons,
  forceUpdateAllSchoolPools
} from './schoolPokemon';

import {
  getPokemonPools,
  savePokemonPools,
  getStudentPokemons,
  saveStudentPokemons
} from './storage';

import {
  getRandomType,
  getRarityForId
} from './types';

import {
  samplePokemons
} from './sampleData';

import {
  handlePokemonDuplicate
} from './duplicateHandler';

export {
  // Student Pokemon operations
  removePokemonFromStudent,
  removePokemonFromStudentAndReturnToPool,
  removeCoinsFromStudent,
  awardCoinsToStudent,
  assignPokemonToStudent,
  assignRandomPokemonToStudent,
  useStudentCoin,
  getStudentPokemonCollection,
  
  // School Pokemon operations
  initializeSchoolPokemonPool,
  getSchoolPokemonPool,
  updateAllSchoolPoolsTo500,
  getRandomPokemonFromPool,
  getClassPokemonPool,
  initializeClassPokemonPool,
  getDailyWheelPokemons,
  forceUpdateAllSchoolPools,
  
  // Storage operations
  getPokemonPools,
  savePokemonPools,
  getStudentPokemons,
  saveStudentPokemons,
  
  // Types and helpers
  getRandomType,
  getRarityForId,
  
  // Sample data
  samplePokemons,
  
  // Duplicate handling
  handlePokemonDuplicate
};
