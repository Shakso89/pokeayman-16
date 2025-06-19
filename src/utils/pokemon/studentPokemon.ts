
import { Pokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";
import { createPokemonAwardNotification } from "@/utils/notificationService";
import { createAdminNotification } from "@/services/adminNotificationService";
import { awardCoinsToStudentEnhanced } from "@/services/enhancedCoinService";

export interface StudentPokemon {
  studentId: string;
  pokemons: Pokemon[];
}

export const getStudentPokemons = async (studentId: string): Promise<Pokemon[]> => {
  try {
    const { data, error } = await supabase
      .from('student_pokemons')
      .select('pokemons')
      .eq('student_id', studentId)
      .single();

    if (error) {
      console.error("Error fetching student's Pokémon:", error);
      return [];
    }

    return data?.pokemons || [];
  } catch (error) {
    console.error("Unexpected error fetching student's Pokémon:", error);
    return [];
  }
};

// Alias for backward compatibility
export const getStudentPokemonCollection = getStudentPokemons;

export const saveStudentPokemons = async (studentId: string, pokemons: Pokemon[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_pokemons')
      .upsert({ student_id: studentId, pokemons: pokemons }, { onConflict: 'student_id' });

    if (error) {
      console.error("Error saving student's Pokémon:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error saving student's Pokémon:", error);
    return false;
  }
};

export const awardPokemonToStudent = async (
  studentId: string,
  pokemonId: number,
  reason: string = "Teacher award"
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  try {
    console.log("🎁 Awarding Pokemon to student", { studentId, pokemonId, reason });

    // Get teacher info for notifications
    const teacherId = localStorage.getItem("teacherId");
    const teacherName = localStorage.getItem("teacherUsername") || "Unknown Teacher";
    
    let teacherDisplayName = teacherName;
    if (teacherId) {
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('display_name')
        .eq('id', teacherId)
        .single();
      
      if (teacherData?.display_name) {
        teacherDisplayName = teacherData.display_name;
      }
    }

    // Get the Pokemon from the catalog
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_catalog')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (pokemonError) {
      console.error("Error fetching Pokemon from catalog:", pokemonError);
      return { success: false, error: "Failed to fetch Pokemon from catalog" };
    }

    if (!pokemon) {
      return { success: false, error: "Pokemon not found in catalog" };
    }

    // Get student's current Pokemon
    const { data: studentPokemonData } = await supabase
      .from('student_pokemons')
      .select('*')
      .eq('student_id', studentId)
      .single();

    let currentPokemons: Pokemon[] = studentPokemonData?.pokemons || [];

    // Add the new Pokemon to the student's collection
    currentPokemons.push(pokemon);

    // Save the updated Pokemon list
    const { data: result, error: updateError } = await supabase
      .from('student_pokemons')
      .upsert({ student_id: studentId, pokemons: currentPokemons }, { onConflict: 'student_id' })
      .select()

    if (updateError) {
      console.error("Error awarding Pokemon to student:", updateError);
      return { success: false, error: "Failed to award Pokemon to student" };
    }

    // Get Pokemon details for the notification
    const { data: pokemonData } = await supabase
      .from('pokemon_catalog')
      .select('name')
      .eq('id', pokemonId)
      .single();

    const pokemonName = pokemonData?.name || `Pokemon #${pokemonId}`;

    // Get student details for the notification
    const { data: studentData } = await supabase
      .from('student_profiles')
      .select('username, display_name')
      .eq('user_id', studentId)
      .single();

    const studentName = studentData?.display_name || studentData?.username || "Unknown Student";

    // Send notification to student
    try {
      await createPokemonAwardNotification(studentId, pokemonName, reason);
    } catch (notificationError) {
      console.warn("Failed to send student notification:", notificationError);
    }

    // Send notification to owners
    try {
      await createAdminNotification({
        teacherName: teacherDisplayName,
        studentName,
        type: 'pokemon_award',
        pokemonName,
        reason
      });
    } catch (adminNotificationError) {
      console.warn("Failed to send admin notification:", adminNotificationError);
    }

    console.log("✅ Pokemon awarded successfully with notifications sent");
    return { success: true, pokemon: result };

  } catch (error) {
    console.error("❌ Error awarding Pokemon:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Random Pokemon assignment function
export const assignRandomPokemonToStudent = async (
  schoolId: string, 
  studentId: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  try {
    // Get available Pokemon from school pool
    const { data: poolPokemons, error: poolError } = await supabase
      .from('pokemon_pools')
      .select('pokemon_id, pokemon_catalog(*)')
      .eq('school_id', schoolId)
      .eq('is_assigned', false)
      .limit(1);

    if (poolError || !poolPokemons || poolPokemons.length === 0) {
      return { success: false, error: "No Pokemon available in school pool" };
    }

    const randomPokemon = poolPokemons[0];
    const pokemonId = randomPokemon.pokemon_id;

    return await awardPokemonToStudent(studentId, pokemonId, "Random award");
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Specific Pokemon assignment function
export const assignSpecificPokemonToStudent = async (
  pokemonId: number,
  schoolId: string,
  studentId: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  return await awardPokemonToStudent(studentId, pokemonId, "Specific award");
};

// Coin awarding function (using the enhanced service)
export const awardCoinsToStudent = async (
  studentId: string,
  amount: number,
  reason: string = "Teacher award"
): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
  return await awardCoinsToStudentEnhanced(studentId, amount, reason);
};

export const removePokemonFromStudent = async (
  collectionIdOrStudentId: string,
  pokemonId?: number,
  reason: string = "Teacher removal"
): Promise<boolean> => {
  try {
    // Handle both old signature (collectionId) and new signature (studentId, pokemonId)
    if (pokemonId !== undefined) {
      // New signature: removePokemonFromStudent(studentId, pokemonId, reason)
      const studentId = collectionIdOrStudentId;
      console.log(`Removing Pokemon ${pokemonId} from student ${studentId}`);

      // Get student's current Pokemon
      const { data, error } = await supabase
        .from('student_pokemons')
        .select('pokemons')
        .eq('student_id', studentId)
        .single();

      if (error) {
        console.error("Error fetching student's Pokémon:", error);
        return false;
      }

      let currentPokemons: Pokemon[] = data?.pokemons || [];

      // Filter out the Pokemon to be removed
      const updatedPokemons = currentPokemons.filter(pokemon => pokemon.id !== pokemonId);

      // Save the updated Pokemon list
      const { error: updateError } = await supabase
        .from('student_pokemons')
        .upsert({ student_id: studentId, pokemons: updatedPokemons }, { onConflict: 'student_id' });

      if (updateError) {
        console.error("Error removing Pokemon from student:", updateError);
        return false;
      }

      console.log(`✅ Pokemon ${pokemonId} removed successfully from student ${studentId}`);
      return true;
    } else {
      // Old signature: removePokemonFromStudent(collectionId)
      // This would need to be handled differently, but for now we'll return false
      console.warn("Old signature for removePokemonFromStudent is deprecated");
      return false;
    }
  } catch (error) {
    console.error("❌ Error removing Pokemon:", error);
    return false;
  }
};
