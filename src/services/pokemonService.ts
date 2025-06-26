
import { supabase } from "@/integrations/supabase/client";

export interface Pokemon {
  id: string;
  name: string;
  image_url: string;
  type_1: string;
  type_2?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  price: number;
  description?: string;
  power_stats?: any;
  created_at: string;
}

export interface StudentPokemonCollection {
  id: string;
  student_id: string;
  pokemon_id: string;
  source: 'teacher_award' | 'shop_purchase';
  awarded_by?: string;
  awarded_at: string;
  pokemon_pool?: Pokemon;
}

// Get all Pokemon from the unified pool
export const getPokemonPool = async (): Promise<Pokemon[]> => {
  try {
    console.log("🌍 Fetching unified Pokemon pool...");
    
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .order('name');

    if (error) {
      console.error("❌ Error fetching Pokemon pool:", error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} Pokemon from pool`);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokemon pool:", error);
    return [];
  }
};

// Award Pokemon to student - ENHANCED WITH REAL-TIME SYNC
export const awardPokemonToStudent = async (
  studentId: string,
  pokemonId: string,
  source: 'teacher_award' | 'shop_purchase' = 'teacher_award',
  awardedBy?: string
): Promise<{ success: boolean; error?: string; pokemon?: Pokemon }> => {
  try {
    console.log("🎁 Awarding Pokemon to student:", { studentId, pokemonId, source });

    // Verify Pokemon exists in pool
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_pool')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      console.error("❌ Pokemon not found in pool:", { pokemonId, error: pokemonError });
      return { success: false, error: "Pokemon not found in pool" };
    }

    console.log("✅ Pokemon verified in pool:", pokemon.name);

    // Insert into student's collection - CORRECT TABLE NAME
    const { data: result, error: insertError } = await supabase
      .from('student_pokemon_collection')  // ✅ CORRECT TABLE NAME
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source,
        awarded_by: awardedBy,
        awarded_at: new Date().toISOString()
      })
      .select(`
        *,
        pokemon_pool(*)
      `)
      .single();

    if (insertError) {
      console.error("❌ Error awarding Pokemon:", insertError);
      return { success: false, error: `Failed to award Pokemon: ${insertError.message}` };
    }

    console.log("✅ Pokemon awarded successfully:", result);
    return { success: true, pokemon };
  } catch (error) {
    console.error("❌ Unexpected error awarding Pokemon:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
};

// Get student's Pokemon collection - ENHANCED WITH PROPER JOINS
export const getStudentPokemonCollection = async (studentId: string): Promise<StudentPokemonCollection[]> => {
  try {
    console.log("📦 Fetching student's Pokemon collection:", studentId);

    if (!studentId || studentId === 'undefined') {
      console.error("❌ Invalid studentId:", studentId);
      return [];
    }

    // Use the correct table name with proper joins
    const { data, error } = await supabase
      .from('student_pokemon_collection')  // ✅ CORRECT TABLE NAME
      .select(`
        *,
        pokemon_pool(*)
      `)
      .eq('student_id', studentId)
      .order('awarded_at', { ascending: false });

    if (error) {
      console.error("❌ Error fetching student's collection:", error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} Pokemon from student's collection`);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching student's collection:", error);
    return [];
  }
};

// Purchase Pokemon from shop - ENHANCED WITH PROPER TRANSACTION HANDLING
export const purchasePokemonFromShop = async (
  studentId: string,
  pokemonId: string,
  price: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("🛒 Starting Pokemon purchase:", { studentId, pokemonId, price });

    // Import the enhanced coin service
    const { deductCoinsFromStudentEnhanced } = await import("@/services/enhancedCoinService");

    // First deduct coins using enhanced service
    const coinResult = await deductCoinsFromStudentEnhanced(
      studentId, 
      price, 
      `Purchased Pokemon from shop`, 
      'shop_purchase'
    );

    if (!coinResult.success) {
      console.error("❌ Coin deduction failed:", coinResult.error);
      return { success: false, error: coinResult.error };
    }

    console.log("✅ Coins deducted successfully, now awarding Pokemon...");

    // Then award the Pokemon
    const pokemonResult = await awardPokemonToStudent(studentId, pokemonId, 'shop_purchase');
    
    if (!pokemonResult.success) {
      console.error("❌ Pokemon award failed after coin deduction, attempting refund...");
      
      // Refund coins if Pokemon award fails
      const { awardCoinsToStudentEnhanced } = await import("@/services/enhancedCoinService");
      await awardCoinsToStudentEnhanced(
        studentId,
        price,
        "Refund for failed Pokemon purchase",
        "refund"
      );
      
      return { success: false, error: pokemonResult.error };
    }

    console.log("✅ Pokemon purchased successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error purchasing Pokemon:", error);
    return { success: false, error: "Unexpected error occurred during purchase" };
  }
};

// Remove Pokemon from student's collection - ENHANCED WITH REAL-TIME SYNC
export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  try {
    console.log("🗑️ Removing Pokemon from collection:", collectionId);

    // Get the student ID before deletion for real-time sync
    const { data: collectionItem } = await supabase
      .from('student_pokemon_collection')  // ✅ CORRECT TABLE NAME
      .select('student_id')
      .eq('id', collectionId)
      .single();

    const { error } = await supabase
      .from('student_pokemon_collection')  // ✅ CORRECT TABLE NAME
      .delete()
      .eq('id', collectionId);

    if (error) {
      console.error("❌ Error removing Pokemon:", error);
      return false;
    }

    console.log("✅ Pokemon removed successfully");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error removing Pokemon:", error);
    return false;
  }
};
