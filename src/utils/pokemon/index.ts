
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
  createPokemonPool,
  getPokemonPool,
  addPokemonToPool,
  removePokemonFromPool
} from './schoolPokemon';

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
  createPokemonPool,
  getPokemonPool,
  addPokemonToPool,
  removePokemonFromPool
};
