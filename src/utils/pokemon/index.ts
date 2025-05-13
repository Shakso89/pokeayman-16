

// Main entry point to aggregate and export all Pokemon utils

// Export from types.ts
export { getRandomType, getRarityForId } from './types';

// Export from storage.ts
export { 
  getPokemonPools, 
  savePokemonPools, 
  getStudentPokemons, 
  saveStudentPokemons 
} from './storage';

// Export from schoolPokemon.ts
export { 
  initializeSchoolPokemonPool, 
  getSchoolPokemonPool, 
  getRandomPokemonFromPool,
  getClassPokemonPool,
  initializeClassPokemonPool,
  getDailyWheelPokemons,
  updateAllSchoolPoolsTo500
} from './schoolPokemon';

// Export from studentPokemon.ts
export { 
  getStudentPokemonCollection, 
  removePokemonFromStudent,
  removePokemonFromStudentAndReturnToPool,
  removeCoinsFromStudent,
  awardCoinsToStudent,
  assignPokemonToStudent,
  assignRandomPokemonToStudent,
  useStudentCoin
} from './studentPokemon';

// Export sample Pokemon data
export { samplePokemons } from './sampleData';

// Export class management functions - using 'export type' for type exports
export {
  classExists,
  saveClass,
  getClassesForSchool,
  deleteClass
} from './classManagement';

// Properly export types using 'export type'
export type { ClassData, SupabaseClassData } from './classManagement';

