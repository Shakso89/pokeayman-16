import { Pokemon, StudentCollectionPokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";

// Helper function to get student profile (no auto-create; must exist)
const getStudentProfileId = async (userId: string): Promise<string | null> => {
  const { data: profile, error: profileError } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (profile) return profile.id;
  if (profileError && profileError.code !== 'PGRST116') {
    console.error(`Error fetching student profile for user_id: ${userId}`, profileError);
  }
  return null;
};

// Assigns (copies) a Pokemon from the static school pool (by id) to a student.
export const assignSpecificPokemonToStudent = async (
  pokemonId: number,
  schoolId: string,
  studentId: string
): Promise<{ success: boolean; pokemon?: Pokemon; error?: string }> => {
  const studentProfileId = await getStudentProfileId(studentId);
  if (!studentProfileId) {
    return { success: false, error: "profile_missing" };
  }

  // Lookup pokemon data from catalog
  const { data: pokemonDetails, error } = await supabase
    .from('pokemon_catalog')
    .select('*')
    .eq('id', pokemonId)
    .single();

  if (error || !pokemonDetails) {
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
    return { success: false, error: insertError.message || "assign_failed" };
  }

  return { success: true, pokemon: pokemonDetails as Pokemon };
};

// Award a random Pokemon from the school's static catalog to student
export const assignRandomPokemonToStudent = async (
  schoolId: string,
  studentId: string
): Promise<{ success: boolean; pokemon?: Pokemon; error?: string }> => {
  const studentProfileId = await getStudentProfileId(studentId);
  if (!studentProfileId) {
    return { success: false, error: "profile_missing" };
  }

  // Get all pokémon in the school's pool
  const { data: available, error: availableError } = await supabase
    .from('pokemon_pools')
    .select('pokemon_id')
    .eq('school_id', schoolId)
    .limit(300);

  if (availableError) {
    return { success: false, error: availableError.message || "supabase_fetch_error" };
  }
  if (!available || available.length === 0) {
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
    return { success: false, error: insertError.message || "assign_failed" };
  }

  return { success: true, pokemon: pokemonDetails as Pokemon };
};

// Removes a Pokemon only from student's collection (does NOT return to pool)
export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  const { error: deleteError } = await supabase
    .from('pokemon_collections')
    .delete()
    .eq('id', collectionId);
  return !deleteError;
};

// Get a student's Pokemon collection from the database.
export const getStudentPokemonCollection = async (studentId: string): Promise<StudentCollectionPokemon[]> => {
  const studentProfileId = await getStudentProfileId(studentId);
  if (!studentProfileId) {
    console.error("Could not get student profile for collection");
    return [];
  }
  const { data, error } = await supabase
    .from('pokemon_collections')
    .select('id, school_id, pokemon_catalog!inner(*)')
    .eq('student_id', studentProfileId);

  if (error) return [];
  return data.map((item: any) => ({
    collectionId: item.id,
    id: item.pokemon_catalog.id,
    name: item.pokemon_catalog.name,
    image: item.pokemon_catalog.image,
    type: item.pokemon_catalog.type,
    rarity: item.pokemon_catalog.rarity,
    powerStats: item.pokemon_catalog.power_stats,
  }));
};

// Award coins to a student - unchanged
export const awardCoinsToStudent = async (studentId: string, amount: number): Promise<boolean> => {
  try {
    // Get current coins first
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('coins')
      .eq('user_id', studentId)
      .single();

    const currentCoins = profile?.coins || 0;
    const newCoins = currentCoins + amount;

    const { error } = await supabase
      .from('student_profiles')
      .update({ coins: newCoins })
      .eq('user_id', studentId);

    if (error) {
      console.error("Error awarding coins to student:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error awarding coins to student:", error);
    return false;
  }
};
