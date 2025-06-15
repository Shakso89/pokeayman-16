import { Pokemon, StudentCollectionPokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";

// Helper function to get student profile (no auto-create; must exist)
const getOrCreateStudentProfile = async (userId: string): Promise<string | null> => {
  // Only try to fetch, do NOT try to create if not found (because of RLS!)
  const { data: profile, error: profileError } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (profile) {
    return profile.id;
  }
  // Profile does not exist (do NOT attempt to create due to RLS)
  if (profileError && profileError.code !== 'PGRST116') {
    console.error(`Error fetching student profile for user_id: ${userId}`, profileError);
  }
  // Return null: let the UI layer handle user feedback to teacher/admin!
  return null;
};

// Assigns a random available Pokemon from a school's pool to a student.
export const assignRandomPokemonToStudent = async (schoolId: string, studentId: string): Promise<{ success: boolean; pokemon?: Pokemon; error?: string }> => {
  console.log(`Attempting to assign random Pokemon to student (user_id: ${studentId}) from school ${schoolId}`);

  const studentProfileId = await getOrCreateStudentProfile(studentId);
  if (!studentProfileId) {
    return { success: false, error: "profile" };
  }

  const { data: available, error: availableError } = await supabase
    .from('pokemon_pools')
    .select('id, pokemon_id')
    .eq('school_id', schoolId)
    .eq('status', 'available')
    .limit(500);

  if (availableError || !available || available.length === 0) {
    return { success: false, error: "empty_pool" };
  }

  const randomEntry = available[Math.floor(Math.random() * available.length)];
  const { id: poolEntryId, pokemon_id: pokemonId } = randomEntry;

  // Try to update the pool row
  const { data: updatedPoolEntry, error: updateError } = await supabase
    .from('pokemon_pools')
    .update({ status: 'assigned', assigned_to_student_id: studentProfileId, assigned_at: new Date().toISOString() })
    .eq('id', poolEntryId)
    .eq('status', 'available')
    .select()
    .single();

  if (updateError || !updatedPoolEntry) {
    return { success: false, error: "assign_failed" };
  }

  // Add to collection
  const { error: insertError } = await supabase
    .from('pokemon_collections')
    .insert({
      student_id: studentProfileId,
      school_id: schoolId,
      pokemon_id: pokemonId,
      pool_entry_id: poolEntryId
    });

  if (insertError) {
    await supabase.from('pokemon_pools').update({ status: 'available', assigned_to_student_id: null, assigned_at: null }).eq('id', poolEntryId);
    return { success: false, error: "assign_failed" };
  }

  const { data: pokemonDetails } = await supabase.from('pokemon_catalog').select('*').eq('id', pokemonId).single();
  return { success: true, pokemon: pokemonDetails as Pokemon };
};

export const assignSpecificPokemonToStudent = async (
  poolEntryId: string,
  pokemonId: number,
  schoolId: string,
  studentId: string
): Promise<{ success: boolean; pokemon?: Pokemon; error?: string }> => {
  const studentProfileId = await getOrCreateStudentProfile(studentId);
  if (!studentProfileId) {
    return { success: false, error: "profile" };
  }

  // Try to update the pool row
  const { data: updatedPoolEntry, error: updateError } = await supabase
    .from('pokemon_pools')
    .update({ status: 'assigned', assigned_to_student_id: studentProfileId, assigned_at: new Date().toISOString() })
    .eq('id', poolEntryId)
    .eq('status', 'available')
    .select()
    .single();

  if (updateError || !updatedPoolEntry) {
    return { success: false, error: "assign_failed" };
  }

  const { error: insertError } = await supabase
    .from('pokemon_collections')
    .insert({
      student_id: studentProfileId,
      school_id: schoolId,
      pokemon_id: pokemonId,
      pool_entry_id: poolEntryId
    });

  if (insertError) {
    await supabase.from('pokemon_pools').update({ status: 'available', assigned_to_student_id: null, assigned_at: null }).eq('id', poolEntryId);
    return { success: false, error: "assign_failed" };
  }

  const { data: pokemonDetails } = await supabase.from('pokemon_catalog').select('*').eq('id', pokemonId).single();
  return { success: true, pokemon: pokemonDetails as Pokemon };
};

// Removes a specific Pokemon from a student's collection and returns it to the school pool.
export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  console.log(`Removing Pokemon with collection ID ${collectionId}`);

  const { data: collectionEntry, error: findError } = await supabase
    .from('pokemon_collections')
    .select('pool_entry_id')
    .eq('id', collectionId)
    .single();

  if (findError || !collectionEntry) {
    console.error("Could not find Pokemon in student's collection", findError);
    return false;
  }

  const { error: deleteError } = await supabase
    .from('pokemon_collections')
    .delete()
    .eq('id', collectionId);

  if (deleteError) {
    console.error("Error deleting from pokemon_collections", deleteError);
    return false;
  }

  const { error: updateError } = await supabase
    .from('pokemon_pools')
    .update({ status: 'available', assigned_to_student_id: null, assigned_at: null })
    .eq('id', collectionEntry.pool_entry_id);

  if (updateError) {
    console.error("Error returning Pokemon to pool. The collection entry was deleted but pool was not updated.", updateError);
    // This is a partial failure state, but we'll return true as the pokemon is removed from student.
  }
  
  return true;
};

// Get a student's Pokemon collection from the database.
export const getStudentPokemonCollection = async (studentId: string): Promise<StudentCollectionPokemon[]> => {
  const studentProfileId = await getOrCreateStudentProfile(studentId);
  if (!studentProfileId) {
    console.error("Could not get or create student profile for collection");
    return [];
  }

  const { data, error } = await supabase
    .from('pokemon_collections')
    .select('id, school_id, pool_entry_id, pokemon_catalog!inner(*)')
    .eq('student_id', studentProfileId);

  if (error) {
    console.error("Error fetching student's pokemon collection", error);
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
};

// Award coins to a student - simplified approach
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
