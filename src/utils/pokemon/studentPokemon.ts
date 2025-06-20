
import { Pokemon } from "@/types/pokemon";
import { supabase } from "@/integrations/supabase/client";
import { createPokemonAwardNotification } from "@/utils/notificationService";
import { createAdminNotification } from "@/services/adminNotificationService";
import { awardCoinsToStudentEnhanced } from "@/services/enhancedCoinService";
import { ensureStudentProfile, createBasicStudentProfile } from "@/services/studentProfileManager";

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
  studentId: string,
  pokemonId: number,
  reason: string = "Teacher award"
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  try {
    console.log("🎁 Awarding Pokemon to student", { studentId, pokemonId, reason });

    // First, ensure the student profile exists
    console.log("🔍 Ensuring student profile exists for:", studentId);
    const profileId = await createBasicStudentProfile(studentId);
    if (!profileId) {
      console.error("❌ Failed to create/find student profile");
      return { success: false, error: "Failed to create student profile" };
    }
    console.log("✅ Student profile ensured:", profileId);

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

    // Get student profile data with multiple fallback strategies
    let studentData;
    
    // Strategy 1: Try by user_id
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, user_id, school_id, username, display_name')
      .eq('user_id', studentId)
      .maybeSingle();

    if (!profileError && profileData) {
      studentData = profileData;
      console.log("✅ Found student profile by user_id:", studentData);
    } else {
      // Strategy 2: Try by id field
      const { data: altProfileData, error: altError } = await supabase
        .from('student_profiles')
        .select('id, user_id, school_id, username, display_name')
        .eq('id', studentId)
        .maybeSingle();

      if (!altError && altProfileData) {
        studentData = altProfileData;
        console.log("✅ Found student profile by id:", studentData);
      } else {
        // Strategy 3: Get from students table and create profile
        const { data: studentFromTable } = await supabase
          .from('students')
          .select('id, username, display_name, school_id')
          .eq('id', studentId)
          .maybeSingle();

        if (studentFromTable) {
          console.log("📝 Creating student profile from students table data");
          const newProfileId = await ensureStudentProfile({
            user_id: studentId,
            username: studentFromTable.username,
            display_name: studentFromTable.display_name,
            school_id: studentFromTable.school_id
          });

          if (newProfileId) {
            const { data: newProfileData } = await supabase
              .from('student_profiles')
              .select('id, user_id, school_id, username, display_name')
              .eq('id', newProfileId)
              .single();
            
            studentData = newProfileData;
            console.log("✅ Created and retrieved new student profile:", studentData);
          }
        }
      }
    }

    if (!studentData) {
      console.error("❌ Could not find or create student profile for:", studentId);
      return { success: false, error: "Student profile not found and could not be created" };
    }

    // Add the Pokemon to the student's collection in pokemon_collections table
    console.log("🎯 Adding Pokemon to collection with student_id:", studentData.user_id);
    const { data: result, error: insertError } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentData.user_id, // Use user_id for consistency
        pokemon_id: pokemonId,
        school_id: studentData.school_id
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Error awarding Pokemon to student:", insertError);
      return { success: false, error: `Failed to award Pokemon: ${insertError.message}` };
    }

    console.log("✅ Pokemon awarded successfully:", result);

    const studentName = studentData.display_name || studentData.username || "Unknown Student";

    // Send notification to student
    try {
      await createPokemonAwardNotification(studentData.user_id, pokemon.name, reason);
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

export const assignSpecificPokemonToStudent = async (
  pokemonId: number,
  schoolId: string,
  studentId: string
): Promise<{ success: boolean; error?: string; pokemon?: any }> => {
  return await awardPokemonToStudent(studentId, pokemonId, "Specific award");
};

export const awardCoinsToStudent = async (
  studentId: string,
  amount: number,
  reason: string = "Teacher award"
): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
  return await awardCoinsToStudentEnhanced(studentId, amount, reason);
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
