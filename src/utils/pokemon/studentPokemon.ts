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
      console.error("❌ Error fetching student's Pokémon:", error);
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

    // Get or create student profile
    console.log("🔍 Getting or creating student profile...");
    const student = await getOrCreateStudentProfile(userId, classId, schoolId);
    if (!student) {
      const error = "Could not create or find student profile";
      console.error("❌ Student profile error:", error);
      return { success: false, error };
    }

    console.log("✅ Student profile found/created:", {
      studentId: student.id,
      username: student.username
    });

    // Get the Pokemon from the catalog
    console.log("🔍 Fetching Pokemon from catalog...");
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_catalog')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      const error = `Pokemon not found in catalog: ${pokemonError?.message || 'Unknown error'}`;
      console.error("❌ Pokemon catalog error:", error);
      return { success: false, error };
    }

    console.log("✅ Pokemon found in catalog:", pokemon.name);

    // Check for duplicates
    console.log("🔍 Checking for duplicate Pokemon...");
    const { data: existingPokemon } = await supabase
      .from('pokemon_collections')
      .select('id')
      .eq('student_id', student.id)
      .eq('pokemon_id', pokemonId)
      .limit(1);

    if (existingPokemon && existingPokemon.length > 0) {
      console.log("⚠️ Student already has this Pokemon, awarding coins instead");
      const coinResult = await awardCoinsToStudentEnhanced(
        userId, 
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

    // Insert into Pokémon collection
    console.log("📝 Adding Pokemon to student collection...");
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

      await createPokemonAwardNotification(student.user_id, pokemon.name, reason);
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
