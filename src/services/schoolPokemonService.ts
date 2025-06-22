
import { supabase } from "@/integrations/supabase/client";
import { SchoolPoolPokemon } from "@/types/pokemon";

// Initialize school Pokemon pool with proper error handling
export const initializeSchoolPokemonPool = async (schoolId: string): Promise<boolean> => {
  try {
    console.log(`🏫 Initializing Pokemon pool for school: ${schoolId}`);
    
    // Check if school already has a pool
    const { data: existingPool, error: checkError } = await supabase
      .from('pokemon_pools')
      .select('id')
      .eq('school_id', schoolId)
      .limit(1);
    
    if (checkError) {
      console.error("❌ Error checking existing pool:", checkError);
      return false;
    }
    
    if (existingPool && existingPool.length > 0) {
      console.log(`✅ School ${schoolId} already has Pokemon pool`);
      return true;
    }
    
    // Get all Pokemon from catalog
    const { data: catalog, error: catalogError } = await supabase
      .from('pokemon_catalog')
      .select('id');
    
    if (catalogError || !catalog || catalog.length === 0) {
      console.error("❌ Could not fetch pokemon catalog:", catalogError);
      return false;
    }
    
    console.log(`📚 Found ${catalog.length} Pokemon in catalog`);
    
    // Create pool entries for each Pokemon (allowing multiple instances)
    const poolEntries = [];
    for (const pokemon of catalog) {
      // Add 3 instances of each Pokemon to the pool
      for (let i = 0; i < 3; i++) {
        poolEntries.push({
          school_id: schoolId,
          pokemon_id: pokemon.id,
          is_assigned: false
        });
      }
    }
    
    console.log(`🎯 Creating ${poolEntries.length} pool entries`);
    
    const { error: insertError } = await supabase
      .from('pokemon_pools')
      .insert(poolEntries);
    
    if (insertError) {
      console.error("❌ Error creating pool entries:", insertError);
      return false;
    }
    
    console.log(`✅ Successfully initialized Pokemon pool for school ${schoolId}`);
    return true;
    
  } catch (error) {
    console.error("❌ Unexpected error initializing Pokemon pool:", error);
    return false;
  }
};

// Get school's available Pokemon pool
export const getSchoolAvailablePokemon = async (schoolId: string): Promise<SchoolPoolPokemon[]> => {
  try {
    console.log(`🔍 Fetching available Pokemon for school: ${schoolId}`);
    
    // First ensure the pool is initialized
    await initializeSchoolPokemonPool(schoolId);
    
    const { data, error } = await supabase
      .from('pokemon_pools')
      .select(`
        id,
        pokemon_id,
        pokemon_catalog!inner(*)
      `)
      .eq('school_id', schoolId)
      .eq('is_assigned', false);

    if (error) {
      console.error("❌ Error fetching school Pokemon pool:", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("⚠️ No available Pokemon found, reinitializing pool...");
      await initializeSchoolPokemonPool(schoolId);
      return getSchoolAvailablePokemon(schoolId);
    }

    const pool: SchoolPoolPokemon[] = data
      .map((item: any) => {
        if (!item.pokemon_catalog) return null;
        
        const pokemon: SchoolPoolPokemon = {
          poolEntryId: item.id,
          id: item.pokemon_catalog.id,
          name: item.pokemon_catalog.name,
          image: item.pokemon_catalog.image,
          type: item.pokemon_catalog.type,
          rarity: item.pokemon_catalog.rarity,
          powerStats: item.pokemon_catalog.power_stats || {}
        };
        
        return pokemon;
      })
      .filter((p): p is SchoolPoolPokemon => p !== null);

    console.log(`✅ Found ${pool.length} available Pokemon`);
    return pool;
    
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokemon pool:", error);
    return [];
  }
};

// Assign Pokemon from school pool to student
export const assignPokemonFromPool = async (
  schoolId: string,
  studentId: string
): Promise<{ success: boolean; pokemon?: any; isDuplicate?: boolean }> => {
  try {
    console.log(`🎁 Assigning Pokemon from pool - School: ${schoolId}, Student: ${studentId}`);
    
    // Get available Pokemon from pool
    const availablePool = await getSchoolAvailablePokemon(schoolId);
    
    if (availablePool.length === 0) {
      console.log("❌ No Pokemon available in pool");
      return { success: false };
    }
    
    // Select random Pokemon from available pool
    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const selectedPokemon = availablePool[randomIndex];
    
    console.log(`🎲 Selected Pokemon: ${selectedPokemon.name}`);
    
    // Check if student already has this Pokemon
    const { data: existingPokemon } = await supabase
      .from('pokemon_collections')
      .select('id')
      .eq('student_id', studentId)
      .eq('pokemon_id', selectedPokemon.id)
      .limit(1);
    
    const isDuplicate = existingPokemon && existingPokemon.length > 0;
    
    // Mark the pool entry as assigned
    const { error: updateError } = await supabase
      .from('pokemon_pools')
      .update({ 
        is_assigned: true,
        assigned_to: studentId,
        assigned_at: new Date().toISOString()
      })
      .eq('id', selectedPokemon.poolEntryId);
    
    if (updateError) {
      console.error("❌ Error marking Pokemon as assigned:", updateError);
      return { success: false };
    }
    
    // Add to student's collection
    const { error: collectionError } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentId,
        pokemon_id: selectedPokemon.id,
        school_id: schoolId
      });
    
    if (collectionError) {
      console.error("❌ Error adding to collection:", collectionError);
      // Rollback the pool assignment
      await supabase
        .from('pokemon_pools')
        .update({ 
          is_assigned: false,
          assigned_to: null,
          assigned_at: null
        })
        .eq('id', selectedPokemon.poolEntryId);
      return { success: false };
    }
    
    console.log(`✅ Pokemon assigned successfully - Duplicate: ${isDuplicate}`);
    return { 
      success: true, 
      pokemon: selectedPokemon,
      isDuplicate 
    };
    
  } catch (error) {
    console.error("❌ Error assigning Pokemon from pool:", error);
    return { success: false };
  }
};
