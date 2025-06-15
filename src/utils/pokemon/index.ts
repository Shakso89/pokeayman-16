
import {
  assignRandomPokemonToStudent,
  removePokemonFromStudent,
  getStudentPokemonCollection,
  awardCoinsToStudent,
  assignSpecificPokemonToStudent,
} from './studentPokemon';

import {
  initializeSchoolPokemonPool,
  getSchoolPokemonPool,
  forceUpdateAllSchoolPools
} from './schoolPokemon';

export {
  // Student Pokemon operations
  assignRandomPokemonToStudent,
  assignSpecificPokemonToStudent,
  removePokemonFromStudent,
  getStudentPokemonCollection,
  awardCoinsToStudent,
  
  // School Pokemon operations
  initializeSchoolPokemonPool,
  getSchoolPokemonPool,
  forceUpdateAllSchoolPools,
};
