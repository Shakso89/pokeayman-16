
import { Pokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";
import { createPokemonAwardNotification } from "@/utils/notificationService";
import { createAdminNotification } from "@/services/adminNotificationService";
import { awardCoinsToStudentEnhanced } from "@/services/enhancedCoinService";
import { getOrCreateStudentProfile } from "@/services/studentDatabase";
import { assignPokemonFromPool } from "@/services/schoolPokemonService";

export interface StudentPokemon {
  studentId: string;
  pokemons: Pokemon[];
}

export const getStudentPokemons = async (studentId: string): Promise<any[]> => {
  try {
    console.log("🔍 Fetching Pokemon for student:", studentId);
    
    const { data, error } = await supabase
      .from('pokemon_collections')
      .select(`
        id,
        pokemon_id,
        obtained_at,
        pokemon_catalog (
          id,
          name,
          image,
          type,
          rarity,
          power_stats
        )
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error("Error fetching student's Pokémon:", error);
      return [];
    }

    console.log("📦 Found Pokemon collections:", data?.length || 0);

    const transformedData = (data || []).map(collection => {
      const pokemonData = collection.pokemon_catalog as any;
      return {
        id: pokemonData?.id || collection.pokemon_id,
        name: pokemonData?.name || `Pokemon #${collection.pokemon_id}`,
        image: pokemonData?.image || '',
        type: pokemonData?.type || 'unknown',
        rarity: pokemonData?.rarity || 'common',
        powerStats: pokemonData?.power_stats || {},
        collectionId: collection.id
      };
    });

    console.log("✅ Transformed Pokemon data:", transformedData.length);
    return transformedData;
  } catch (error) {
    console.error("Unexpected error fetching student's Pokémon:", error);
    return [];
  }
};

export const getStudentPokemonCollection = getStudentPokemons;

export const awardPokemonToStudent = async (
  userId: string,
  pokemonId: number,
  reason: string = "Teacher award",
  classId?: string,
  schoolId?: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  try {
    console.log("🎁 Awarding Pokemon to student", { userId, pokemonId, reason, classId, schoolId });

    // Get or create student profile
    const student = await getOrCreateStudentProfile(userId, classId, schoolId);
    if (!student) {
      return { success: false, error: "Could not create or find student profile" };
    }

    // Get the Pokemon from the catalog
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_catalog')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      console.error("Error fetching Pokemon from catalog:", pokemonError);
      return { success: false, error: "Pokemon not found in catalog" };
    }

    // Insert into Pokémon collection
    const { data: result, error: insertError } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: student.id,
        pokemon_id: pokemonId,
        school_id: schoolId || student.school_id
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Failed to award Pokemon:", insertError);
      return { success: false, error: `Failed to award Pokemon: ${insertError.message}` };
    }

    console.log("✅ Pokemon awarded successfully:", result);

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

    const studentName = student.display_name || student.username || "Unknown Student";

    // Send notifications
    try {
      await createPokemonAwardNotification(student.user_id, pokemon.name, reason);
    } catch (notificationError) {
      console.warn("Failed to send student notification:", notificationError);
    }

    try {
      await createAdminNotification({
        teacherName: teacherDisplayName,
        studentName,
        type: 'pokemon_award',
        pokemonName: pokemon.name,
        reason
      });
    } catch (adminNotificationError) {
      console.warn("Failed to send admin notification:", adminNotificationError);
    }

    console.log("✅ Pokemon awarded successfully with notifications sent");
    return { success: true, pokemon: { ...pokemon, collectionId: result.id } };

  } catch (error) {
    console.error("❌ Error awarding Pokemon:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Random Pokemon assignment using school pool
export const assignRandomPokemonToStudent = async (
  schoolId: string, 
  userId: string,
  classId?: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  try {
    console.log("🎲 Assigning random Pokemon from school pool", { schoolId, userId, classId });
    
    // Get or create student profile
    const student = await getOrCreateStudentProfile(userId, classId, schoolId);
    if (!student) {
      return { success: false, error: "Could not create or find student profile" };
    }

    // Assign Pokemon from school pool
    const result = await assignPokemonFromPool(schoolId, student.id);
    
    if (!result.success) {
      return { success: false, error: "No Pokemon available in school pool" };
    }

    console.log("✅ Random Pokemon assigned successfully");
    return result;
    
  } catch (error) {
    console.error("❌ Error assigning random Pokemon:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

export const assignSpecificPokemonToStudent = async (
  pokemonId: number,
  schoolId: string,
  userId: string,
  classId?: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  return await awardPokemonToStudent(userId, pokemonId, "Specific award", classId, schoolId);
};

export const awardCoinsToStudent = async (
  userId: string,
  amount: number,
  reason: string = "Teacher award",
  classId?: string,
  schoolId?: string
): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
  return await awardCoinsToStudentEnhanced(userId, amount, reason, "teacher_award", classId, schoolId);
};

export const removePokemonFromStudent = async (
  collectionId: string,
  pokemonId?: number,
  reason: string = "Teacher removal"
): Promise<boolean> => {
  try {
    console.log(`Removing Pokemon collection ${collectionId}`);

    const { error } = await supabase
      .from('pokemon_collections')
      .delete()
      .eq('id', collectionId);

    if (error) {
      console.error("Error removing Pokemon from student:", error);
      return false;
    }

    console.log(`✅ Pokemon collection ${collectionId} removed successfully`);
    return true;
  } catch (error) {
    console.error("❌ Error removing Pokemon:", error);
    return false;
  }
};
