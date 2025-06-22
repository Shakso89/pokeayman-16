
import { Pokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";
import { createPokemonAwardNotification } from "@/utils/notificationService";
import { createAdminNotification } from "@/services/adminNotificationService";
import { awardCoinsToStudentEnhanced } from "@/services/enhancedCoinService";

export interface StudentPokemon {
  studentId: string;
  pokemons: Pokemon[];
}

export const getStudentPokemons = async (studentId: string): Promise<any[]> => {
  try {
    console.log("🔍 Fetching Pokemon for student:", studentId);
    
    // Fetch from pokemon_collections table joined with pokemon_catalog to get full Pokemon data with collection IDs
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

    // Transform the data to match StudentCollectionPokemon interface
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
  userId: string,
  pokemonId: number,
  reason: string = "Teacher award",
  classId?: string,
  schoolId?: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  try {
    console.log("🎁 Awarding Pokemon to student", { userId, pokemonId, reason, classId, schoolId });

    // Step 1: Get or create student profile in students table
    let { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!student) {
      console.log("📝 Creating new student profile for Pokemon award:", userId);
      
      // Generate a unique username
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const uniqueUsername = `student_${timestamp}_${randomSuffix}`;
      
      const { data: created, error: createError } = await supabase
        .from("students")
        .insert({
          user_id: userId,
          username: uniqueUsername,
          display_name: `Student ${userId.slice(0, 8)}`,
          class_id: classId || null,
          school_id: schoolId || null,
          password_hash: 'temp_hash', // Required field
          coins: 0
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Could not create student profile:", createError);
        return { success: false, error: `Could not create student profile: ${createError.message}` };
      }

      student = created;
      console.log("✅ Created student profile for Pokemon award:", student.id);
    }

    // Step 2: Get the Pokemon from the catalog
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_catalog')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      console.error("Error fetching Pokemon from catalog:", pokemonError);
      return { success: false, error: "Pokemon not found in catalog" };
    }

    // Step 3: Insert into Pokémon collection using the correct student ID
    const { data: result, error: insertError } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: student.id, // Use the actual student.id from students table
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

    // Send notification to student
    try {
      await createPokemonAwardNotification(student.user_id, pokemon.name, reason);
    } catch (notificationError) {
      console.warn("Failed to send student notification:", notificationError);
    }

    // Send notification to owners
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

// Random Pokemon assignment function using the new structure
export const assignRandomPokemonToStudent = async (
  schoolId: string, 
  userId: string,
  classId?: string
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

    return await awardPokemonToStudent(userId, pokemonId, "Random award", classId, schoolId);
  } catch (error) {
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

    // Remove from pokemon_collections table using the collection ID
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
