
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

// Export class management functions
export {
  classExists,
  saveClass,
  getClassesBySchoolId,  // Changed from getClassesForSchool to match actual function name
  deleteClass
} from './classManagement';

// Properly export types using 'export type'
export type { ClassData } from './classManagement';  // Removed SupabaseClassData as it doesn't exist

