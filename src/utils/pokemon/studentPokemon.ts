

import { Pokemon, StudentCollectionPokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";
import { ensureStudentProfile } from "@/services/studentProfileManager";

// Helper function to get or create student profile with better error handling
const getOrCreateStudentProfileId = async (userId: string): Promise<string | null> => {
  try {
    console.log(`Getting or creating profile for user: ${userId}`);
    
    // First try to get existing profile
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile) {
      console.log(`Found existing profile: ${profile.id}`);
      return profile.id;
    }
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error(`Error fetching student profile for user_id: ${userId}`, profileError);
    }

    // Profile doesn't exist, create it using the improved profile manager
    console.log(`Creating new student profile for user_id: ${userId}`);
    
    // Try to get student data from students table first
    const { data: studentData } = await supabase
      .from('students')
      .select('username, display_name, school_id, teacher_id, class_id')
      .eq('id', userId)
      .maybeSingle();

    // Prepare profile data with fallbacks
    const profileData = {
      user_id: userId,
      username: studentData?.username || `student_${userId.slice(0, 8)}`,
      display_name: studentData?.display_name || studentData?.username || `Student ${userId.slice(0, 8)}`,
      school_id: studentData?.school_id,
      teacher_id: studentData?.teacher_id,
      class_id: studentData?.class_id
    };

    const profileId = await ensureStudentProfile(profileData);
    
    if (!profileId) {
      console.error(`Failed to create profile for user: ${userId}`);
      return null;
    }

    console.log(`Successfully created profile: ${profileId} for user: ${userId}`);
    return profileId;
  } catch (error) {
    console.error(`Error in getOrCreateStudentProfileId for user ${userId}:`, error);
    return null;
  }
};

// Assigns (copies) a Pokemon from the static school pool (by id) to a student.
export const assignSpecificPokemonToStudent = async (
  pokemonId: number,
  schoolId: string,
  studentId: string
): Promise<{ success: boolean; pokemon?: Pokemon; error?: string }> => {
  try {
    console.log(`Assigning Pokemon ${pokemonId} to student ${studentId}`);
    
    const studentProfileId = await getOrCreateStudentProfileId(studentId);
    if (!studentProfileId) {
      console.error(`Failed to get or create profile for student: ${studentId}`);
      return { success: false, error: "Could not create or find student profile" };
    }

    // Lookup pokemon data from catalog
    const { data: pokemonDetails, error } = await supabase
      .from('pokemon_catalog')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (error || !pokemonDetails) {
      console.error(`Pokemon not found in catalog: ${pokemonId}`, error);
      return { success: false, error: error?.message || "pokemon_not_found" };
    }

    // Copy to student's collection (no unique/depletion logic)
    const { error: insertError } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentProfileId,
        school_id: schoolId,
        pokemon_id: pokemonId
      });

    if (insertError) {
      console.error(`Failed to assign pokemon to student`, insertError);
      return { success: false, error: insertError.message || "assign_failed" };
    }

    console.log(`Successfully assigned pokemon ${pokemonDetails.name} to student ${studentId}`);
    return { success: true, pokemon: pokemonDetails as Pokemon };
  } catch (error: any) {
    console.error('Error in assignSpecificPokemonToStudent:', error);
    return { success: false, error: error.message || "unknown_error" };
  }
};

// Award a random Pokemon from the school's static catalog to student
export const assignRandomPokemonToStudent = async (
  schoolId: string,
  studentId: string
): Promise<{ success: boolean; pokemon?: Pokemon; error?: string }> => {
  try {
    console.log(`Assigning random Pokemon to student ${studentId} from school ${schoolId}`);
    
    const studentProfileId = await getOrCreateStudentProfileId(studentId);
    if (!studentProfileId) {
      console.error(`Failed to get or create profile for student: ${studentId}`);
      return { success: false, error: "Could not create or find student profile" };
    }

    // Get all pokémon in the school's pool
    const { data: available, error: availableError } = await supabase
      .from('pokemon_pools')
      .select('pokemon_id')
      .eq('school_id', schoolId)
      .limit(300);

    if (availableError) {
      console.error(`Error fetching school pool`, availableError);
      return { success: false, error: availableError.message || "supabase_fetch_error" };
    }
    if (!available || available.length === 0) {
      console.error(`School pool is empty for school: ${schoolId}`);
      return { success: false, error: "empty_pool" };
    }

    const randomEntry = available[Math.floor(Math.random() * available.length)];
    const { pokemon_id: pokemonId } = randomEntry;

    // Copy pokemon details from catalog to student collection
    const { data: pokemonDetails, error: pokemonError } = await supabase
      .from('pokemon_catalog')
      .select('*')
      .eq('id', pokemonId)
      .single();
    if (pokemonError || !pokemonDetails) {
      console.error(`Pokemon not found in catalog: ${pokemonId}`, pokemonError);
      return { success: false, error: pokemonError?.message || "pokemon_not_found" };
    }

    const { error: insertError } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentProfileId,
        school_id: schoolId,
        pokemon_id: pokemonId
      });

    if (insertError) {
      console.error(`Failed to assign random pokemon to student`, insertError);
      return { success: false, error: insertError.message || "assign_failed" };
    }

    console.log(`Successfully assigned random pokemon ${pokemonDetails.name} to student ${studentId}`);
    return { success: true, pokemon: pokemonDetails as Pokemon };
  } catch (error: any) {
    console.error('Error in assignRandomPokemonToStudent:', error);
    return { success: false, error: error.message || "unknown_error" };
  }
};

// Removes a Pokemon only from student's collection (does NOT return to pool)
export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  try {
    const { error: deleteError } = await supabase
      .from('pokemon_collections')
      .delete()
      .eq('id', collectionId);
    
    if (deleteError) {
      console.error(`Failed to remove pokemon from collection`, deleteError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in removePokemonFromStudent:', error);
    return false;
  }
};

// Get a student's Pokemon collection from the database.
export const getStudentPokemonCollection = async (studentId: string): Promise<StudentCollectionPokemon[]> => {
  try {
    const studentProfileId = await getOrCreateStudentProfileId(studentId);
    if (!studentProfileId) {
      console.error("Could not get or create student profile for collection");
      return [];
    }
    
    const { data, error } = await supabase
      .from('pokemon_collections')
      .select('id, school_id, pokemon_catalog!inner(*)')
      .eq('student_id', studentProfileId);

    if (error) {
      console.error(`Error fetching pokemon collection for student`, error);
      return [];
    }
    
    return data.map((item: any) => ({
      collectionId: item.id,
      id: item.pokemon_catalog.id,
      name: item.pokemon_catalog.name,
      image: item.pokemon_catalog.image,
      type: item.pokemon_catalog.type,
      rarity: item.pokemon_catalog.rarity,
      powerStats: item.pokemon_catalog.power_stats,
    }));
  } catch (error) {
    console.error('Error in getStudentPokemonCollection:', error);
    return [];
  }
};

// Award coins to a student using the improved profile manager
export const awardCoinsToStudent = async (studentId: string, amount: number): Promise<boolean> => {
  try {
    console.log(`Awarding ${amount} coins to student ${studentId}`);
    
    const studentProfileId = await getOrCreateStudentProfileId(studentId);
    if (!studentProfileId) {
      console.error("Could not get or create student profile for coins");
      return false;
    }

    // Get current coins first
    const { data: profile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('coins')
      .eq('id', studentProfileId)
      .single();

    if (fetchError) {
      console.error("Error fetching current coins:", fetchError);
      return false;
    }

    const currentCoins = profile?.coins || 0;
    const newCoins = currentCoins + amount;

    const { error } = await supabase
      .from('student_profiles')
      .update({ coins: newCoins })
      .eq('id', studentProfileId);

    if (error) {
      console.error("Error awarding coins to student:", error);
      return false;
    }

    console.log(`Successfully awarded ${amount} coins to student ${studentId}. New balance: ${newCoins}`);
    return true;
  } catch (error) {
    console.error("Error awarding coins to student:", error);
    return false;
  }
};

