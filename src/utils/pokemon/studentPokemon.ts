import { Pokemon, StudentCollectionPokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";

// Assigns a random available Pokemon from a school's pool to a student.
export const assignRandomPokemonToStudent = async (schoolId: string, studentId: string): Promise<{ success: boolean; pokemon?: Pokemon }> => {
  console.log(`Assigning random Pokemon to student ${studentId} from school ${schoolId}`);
  
  const { data: available, error: availableError } = await supabase
    .from('pokemon_pools')
    .select('id, pokemon_id')
    .eq('school_id', schoolId)
    .eq('status', 'available')
    .limit(500); // Fetch a reasonable number to pick from

  if (availableError || !available || available.length === 0) {
    console.error("No available Pokemon in school pool or error fetching.", availableError);
    return { success: false };
  }

  const randomEntry = available[Math.floor(Math.random() * available.length)];
  const { id: poolEntryId, pokemon_id: pokemonId } = randomEntry;

  // Update pokemon_pools to mark as assigned
  const { data: updatedPoolEntry, error: updateError } = await supabase
    .from('pokemon_pools')
    .update({ status: 'assigned', assigned_to_student_id: studentId, assigned_at: new Date().toISOString() })
    .eq('id', poolEntryId)
    .eq('status', 'available') // Ensure it hasn't been claimed by another process
    .select()
    .single();

  if (updateError || !updatedPoolEntry) {
    console.error("Failed to assign Pokemon, it might have been claimed.", updateError);
    return { success: false };
  }

  // Insert into pokemon_collections
  const { error: insertError } = await supabase
    .from('pokemon_collections')
    .insert({
      student_id: studentId,
      school_id: schoolId,
      pokemon_id: pokemonId,
      pool_entry_id: poolEntryId
    });

  if (insertError) {
    // Rollback the assignment if collection insert fails
    await supabase.from('pokemon_pools').update({ status: 'available', assigned_to_student_id: null, assigned_at: null }).eq('id', poolEntryId);
    console.error("Error inserting into pokemon_collections, rolling back.", insertError);
    return { success: false };
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
  const { data, error } = await supabase
    .from('pokemon_collections')
    .select('id, school_id, pool_entry_id, pokemon_catalog!inner(*)')
    .eq('student_id', studentId);

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

// Use/spend student coins
export const useStudentCoin = (studentId: string, amount: number): boolean => {
  // This is a simplified implementation - in a real app you'd want to check current coins first
  console.log(`Using ${amount} coins for student ${studentId}`);
  return true;
};
