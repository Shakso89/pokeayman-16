
import {
  awardPokemonToStudent,
  assignRandomPokemonToStudent,
  assignSpecificPokemonToStudent,
  removePokemonFromStudent,
  getStudentPokemonCollection,
  awardCoinsToStudent,
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
  awardPokemonToStudent,
  
  // School Pokemon operations
  initializeSchoolPokemonPool,
  getSchoolPokemonPool,
  forceUpdateAllSchoolPools,
};
