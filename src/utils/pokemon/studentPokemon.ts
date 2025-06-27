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
    
    if (!studentId || studentId === 'undefined') {
      console.error("❌ Invalid studentId for Pokemon fetch:", studentId);
      return [];
    }

    // Determine the correct user_id to use for Pokemon lookup
    let actualUserId = studentId;
    
    // First check if this is already a user_id by looking in student_profiles
    const { data: profileCheck } = await supabase
      .from('student_profiles')
      .select('user_id')
      .eq('user_id', studentId)
      .maybeSingle();
    
    if (profileCheck) {
      actualUserId = profileCheck.user_id;
    } else {
      // Check if studentId is an ID from students table, get the user_id
      const { data: studentData } = await supabase
        .from('students')
        .select('user_id')
        .eq('id', studentId)
        .maybeSingle();
      
      if (studentData?.user_id) {
        actualUserId = studentData.user_id;
      }
    }

    console.log("🔍 Using actual user_id for lookup:", actualUserId);

    // Use the correct table name: student_pokemon_collection
    const { data, error } = await supabase
      .from('student_pokemon_collection')
      .select(`
        id,
        pokemon_id,
        awarded_at,
        pokemon_pool!student_pokemon_collection_pokemon_id_fkey (
          id,
          name,
          image_url,
          type_1,
          type_2,
          rarity,
          power_stats
        )
      `)
      .eq('student_id', actualUserId);

    if (error) {
      console.error("❌ Error fetching student's Pokémon:", error);
      return [];
    }

    console.log("📦 Found Pokemon collections:", data?.length || 0);

    const transformedData = (data || []).map(collection => {
      const pokemonData = Array.isArray(collection.pokemon_pool) ? collection.pokemon_pool[0] : collection.pokemon_pool;
      return {
        id: pokemonData?.id || collection.pokemon_id,
        name: pokemonData?.name || `Pokemon #${collection.pokemon_id}`,
        image: pokemonData?.image_url || '',
        type: pokemonData?.type_1 || 'unknown',
        rarity: pokemonData?.rarity || 'common',
        powerStats: pokemonData?.power_stats || {},
        collectionId: collection.id
      };
    });

    console.log("✅ Transformed Pokemon data:", transformedData.length);
    return transformedData;
  } catch (error) {
    console.error("❌ Unexpected error fetching student's Pokémon:", error);
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
    console.log("🎁 Awarding Pokemon to student", { 
      userId, 
      pokemonId, 
      reason, 
      classId, 
      schoolId 
    });

    // Validate inputs
    if (!userId || userId === 'undefined') {
      const error = "Invalid or missing user ID";
      console.error("❌ Validation error:", error);
      return { success: false, error };
    }

    if (!pokemonId || pokemonId <= 0) {
      const error = "Invalid Pokemon ID";
      console.error("❌ Validation error:", error);
      return { success: false, error };
    }

    // Get or create student profile to ensure consistency
    console.log("🔍 Getting or creating student profile...");
    const student = await getOrCreateStudentProfile(userId, classId, schoolId);
    if (!student) {
      const error = "Could not create or find student profile";
      console.error("❌ Student profile error:", error);
      return { success: false, error };
    }

    // Use the user_id from the profile (which should be the same as the input userId)
    const targetUserId = student.user_id;

    console.log("✅ Using target user_id for Pokemon award:", targetUserId);

    // Get the Pokemon from the pokemon_pool table
    console.log("🔍 Fetching Pokemon from pokemon_pool...");
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_pool')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      const error = `Pokemon not found in pokemon_pool: ${pokemonError?.message || 'Unknown error'}`;
      console.error("❌ Pokemon pool error:", error);
      return { success: false, error };
    }

    console.log("✅ Pokemon found in pokemon_pool:", pokemon.name);

    // Check for duplicates using the correct user_id and table
    console.log("🔍 Checking for duplicate Pokemon...");
    const { data: existingPokemon } = await supabase
      .from('student_pokemon_collection')
      .select('id')
      .eq('student_id', targetUserId)
      .eq('pokemon_id', pokemonId)
      .limit(1);

    if (existingPokemon && existingPokemon.length > 0) {
      console.log("⚠️ Student already has this Pokemon, awarding coins instead");
      const coinResult = await awardCoinsToStudentEnhanced(
        targetUserId, 
        3, 
        "Duplicate Pokemon compensation", 
        "duplicate_pokemon",
        classId,
        schoolId
      );
      
      if (coinResult.success) {
        return { 
          success: true, 
          pokemon: { ...pokemon, isDuplicate: true, coinsAwarded: 3 }
        };
      } else {
        return { success: false, error: "Failed to award duplicate compensation" };
      }
    }

    // Insert into student_pokemon_collection using the correct user_id
    console.log("📝 Adding Pokemon to student collection...");
    const { data: result, error: insertError } = await supabase
      .from('student_pokemon_collection')
      .insert({
        student_id: targetUserId,
        pokemon_id: pokemonId,
        source: 'teacher_award'
      })
      .select()
      .single();

    if (insertError) {
      const error = `Failed to add Pokemon to collection: ${insertError.message}`;
      console.error("❌ Collection insert error:", insertError);
      return { success: false, error };
    }

    console.log("✅ Pokemon added to collection successfully:", result);

    // Send notifications (don't fail if these fail)
    try {
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

      await createPokemonAwardNotification(targetUserId, pokemon.name, reason);
      await createAdminNotification({
        teacherName: teacherDisplayName,
        studentName,
        type: 'pokemon_award',
        pokemonName: pokemon.name,
        reason
      });

      console.log("✅ Notifications sent successfully");
    } catch (notificationError) {
      console.warn("⚠️ Failed to send notifications:", notificationError);
    }

    console.log("✅ Pokemon awarded successfully with all notifications sent");
    return { success: true, pokemon: { ...pokemon, collectionId: result.id } };

  } catch (error) {
    console.error("❌ Unexpected error awarding Pokemon:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { 
      success: false, 
      error: `Pokemon awarding failed: ${errorMessage}` 
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
    
    const student = await getOrCreateStudentProfile(userId, classId, schoolId);
    if (!student) {
      return { success: false, error: "Could not create or find student profile" };
    }

    const result = await assignPokemonFromPool(schoolId, student.user_id);
    
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

    // Use the correct table name
    const { error } = await supabase
      .from('student_pokemon_collection')
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
