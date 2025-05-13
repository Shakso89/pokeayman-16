
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

// Class management functions with Supabase integration
export const classExists = async (classData: any) => {
  try {
    // First try Supabase
    const { data, error } = await supabase
      .from('classes')
      .select('id')
      .eq('name', classData.name)
      .eq('school_id', classData.schoolId);
      
    if (error) {
      console.error("Error checking if class exists in database:", error);
      
      // Fallback to localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      return allClasses.some((cls: any) => cls.name === classData.name && cls.schoolId === classData.schoolId);
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Exception in classExists:", error);
    
    // Fallback to localStorage
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    return allClasses.some((cls: any) => cls.name === classData.name && cls.schoolId === classData.schoolId);
  }
};

// Save a class to database and localStorage
export const saveClass = async (classData: any) => {
  try {
    // Check if class already exists
    const exists = await classExists(classData);
    if (exists) {
      return { success: false, message: "A class with this name already exists" };
    }
    
    // Try to save to Supabase
    const { data, error } = await supabase
      .from('classes')
      .insert({
        id: classData.id,
        name: classData.name,
        school_id: classData.schoolId,
        teacher_id: classData.teacherId
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error saving class to database:", error);
      
      // Fallback to localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      allClasses.push(classData);
      localStorage.setItem("classes", JSON.stringify(allClasses));
      
      return { success: true, classId: classData.id };
    }
    
    return { success: true, classId: data.id };
  } catch (error) {
    console.error("Error saving class:", error);
    
    // Fallback to localStorage
    try {
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      allClasses.push(classData);
      localStorage.setItem("classes", JSON.stringify(allClasses));
      
      return { success: true, classId: classData.id };
    } catch (error) {
      console.error("Error saving class to localStorage:", error);
      return { success: false, message: "Error saving class data" };
    }
  }
};

// Get classes for a school
export const getClassesForSchool = async (schoolId: string) => {
  try {
    // Try to get from Supabase
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId);
      
    if (error) {
      console.error("Error fetching classes from database:", error);
      
      // Fallback to localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      return allClasses.filter((cls: any) => cls.schoolId === schoolId);
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    
    // Fallback to localStorage
    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    return allClasses.filter((cls: any) => cls.schoolId === schoolId);
  }
};

// Delete a class
export const deleteClass = async (classId: string) => {
  try {
    // Try to delete from Supabase
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
      
    if (error) {
      console.error("Error deleting class from database:", error);
      
      // Fallback to localStorage
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const updatedClasses = allClasses.filter((cls: any) => cls.id !== classId);
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting class:", error);
    
    // Fallback to localStorage
    try {
      const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const updatedClasses = allClasses.filter((cls: any) => cls.id !== classId);
      localStorage.setItem("classes", JSON.stringify(updatedClasses));
      
      return true;
    } catch (error) {
      console.error("Error deleting class from localStorage:", error);
      return false;
    }
  }
};

// Import Supabase client
import { supabase } from "@/integrations/supabase/client";
