
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

// Check if a class exists to prevent duplication
export const classExists = (classData: any) => {
  const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
  return allClasses.some((cls: any) => cls.name === classData.name && cls.schoolId === classData.schoolId);
};

// Save a class to localStorage
export const saveClass = (classData: any) => {
  try {
    // Get all classes
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    
    // Check if class already exists
    if (classExists(classData)) {
      return { success: false, message: "A class with this name already exists" };
    }
    
    // Add new class
    allClasses.push(classData);
    
    // Save to localStorage
    localStorage.setItem("classes", JSON.stringify(allClasses));
    
    return { success: true, classId: classData.id };
  } catch (error) {
    console.error("Error saving class:", error);
    return { success: false, message: "Error saving class data" };
  }
};

// Get classes for a school
export const getClassesForSchool = (schoolId: string) => {
  const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
  return allClasses.filter((cls: any) => cls.schoolId === schoolId);
};

// Delete a class
export const deleteClass = (classId: string) => {
  try {
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const updatedClasses = allClasses.filter((cls: any) => cls.id !== classId);
    
    // Just update the classes in localStorage
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    
    // We don't actually delete student associations or homework
    // This allows the data to persist even if a class is "deleted"
    
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    return false;
  }
};
