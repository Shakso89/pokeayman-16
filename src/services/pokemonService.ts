
// src/services/pokemonService.ts

import { supabase } from "@/integrations/supabase/client";

// --- Type Definitions ---

/**
 * Defines the structure of a single Pokémon entry as it exists in your `pokemon_catalog` table.
 * IMPORTANT: Ensure these property names (e.g., `image_url`, `type_1`)
 * exactly match the column names in your `pokemon_catalog` table in Supabase.
 */
export interface PokemonCatalogItem {
  id: string;
  name: string;
  image_url: string; // e.g., '/images/charmander.png'
  type_1: string;    // e.g., 'Fire', 'Water', 'Ground'
  type_2?: string;   // Optional: for dual-type Pokémon (e.g., 'Flying', 'Poison')
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  price: number;
  description?: string;
  power_stats?: any; // Assuming JSONB or similar
  created_at: string;
}

// Legacy type alias for backward compatibility
export type Pokemon = PokemonCatalogItem;

/**
 * Defines the structure of a single entry in the `pokemon_collections` table,
 * including the joined Pokémon details from `pokemon_catalog`.
 */
export interface StudentPokemonCollectionItem {
  id: string; // The primary key ID of this specific collection entry
  student_id: string; // Foreign key to the student who owns this Pokémon
  pokemon_id: string; // Foreign key to the specific Pokémon in the pokemon_catalog
  source: 'teacher_award' | 'shop_purchase' | 'event_reward' | 'refund'; // Expanded possible sources
  awarded_by?: string; // Optional: who awarded it (e.g., teacher_id)
  obtained_at: string; // Timestamp of when the Pokémon was added to the collection (matches DB column name)

  /**
   * The joined data from the `pokemon_catalog` table.
   * This property will contain all the details of the Pokémon itself.
   */
  pokemon_catalog: PokemonCatalogItem | null; // `null` if the join failed for some reason
}

// Legacy type alias for backward compatibility
export type StudentPokemonCollection = StudentPokemonCollectionItem;

// --- Service Functions ---

/**
 * Get all available Pokémon from the main catalog/pool.
 * This should target your `pokemon_catalog` table.
 */
export const getPokemonCatalog = async (): Promise<PokemonCatalogItem[]> => {
  try {
    console.log("🌍 Fetching Pokemon catalog...");

    const { data, error } = await supabase
      .from('pokemon_catalog')
      .select('*')
      .order('name');

    if (error) {
      console.error("❌ Error fetching Pokemon catalog:", error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} Pokemon from catalog`);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokemon catalog:", error);
    return [];
  }
};

// Legacy function alias for backward compatibility
export const getPokemonPool = getPokemonCatalog;

/**
 * Award Pokemon to a student and add it to their collection.
 * This inserts a new record into `pokemon_collections`.
 */
export const awardPokemonToStudent = async (
  studentId: string,
  pokemonId: string,
  source: 'teacher_award' | 'shop_purchase' = 'teacher_award',
  awardedBy?: string
): Promise<{ success: boolean; error?: string; pokemon?: PokemonCatalogItem }> => {
  try {
    console.log("🎁 Awarding Pokemon to student:", { studentId, pokemonId, source, awardedBy });

    // Verify Pokemon exists in catalog
    const { data: pokemon, error: pokemonError } = await supabase
      .from('pokemon_catalog')
      .select('*')
      .eq('id', pokemonId)
      .single();

    if (pokemonError || !pokemon) {
      console.error("❌ Pokemon not found in catalog:", { pokemonId, error: pokemonError });
      return { success: false, error: "Pokemon not found in catalog" };
    }

    console.log("✅ Pokemon verified in catalog:", pokemon.name);

    // Insert into student's collection
    const { data: result, error: insertError } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentId,
        pokemon_id: pokemonId,
        source,
        awarded_by: awardedBy,
        obtained_at: new Date().toISOString()
      })
      .select(`
        *,
        pokemon_catalog(*)
      `)
      .single();

    if (insertError) {
      console.error("❌ Error awarding Pokemon:", insertError);
      return { success: false, error: `Failed to award Pokemon: ${insertError.message}` };
    }

    console.log("✅ Pokemon awarded successfully:", result);
    return { success: true, pokemon: pokemon };
  } catch (error) {
    console.error("❌ Unexpected error awarding Pokemon:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
};

/**
 * Get a student's entire Pokémon collection.
 * @param studentId The ID of the student.
 * @returns A Promise resolving to an array of `StudentPokemonCollectionItem` (with joined Pokémon details).
 */
export const getStudentPokemonCollection = async (studentId: string): Promise<StudentPokemonCollectionItem[]> => {
  try {
    console.log("📦 Fetching student's Pokemon collection:", studentId);

    if (!studentId || studentId === 'undefined') {
      console.error("❌ Invalid studentId provided for collection fetch:", studentId);
      return [];
    }

    // Use the correct table name with proper joins
    const { data, error } = await supabase
      .from('pokemon_collections')
      .select(`
        id,
        student_id,
        pokemon_id,
        source,
        awarded_by,
        obtained_at,
        pokemon_catalog(*)
      `)
      .eq('student_id', studentId)
      .order('obtained_at', { ascending: false });

    if (error) {
      console.error("❌ Error fetching student's collection:", error);
      return [];
    }

    // Ensure data is not null and filter out entries where join might have failed
    const collection = (data || []).filter(item => item.pokemon_catalog !== null) as StudentPokemonCollectionItem[];

    console.log(`✅ Fetched ${collection.length || 0} Pokemon from student's collection`);
    return collection;
  } catch (error) {
    console.error("❌ Unexpected error fetching student's collection:", error);
    return [];
  }
};

/**
 * Handles the complete process of purchasing a Pokemon from the shop,
 * including coin deduction and adding the Pokemon to the collection.
 * Includes a basic refund mechanism if the Pokemon award fails.
 */
export const purchasePokemonFromShop = async (
  studentId: string,
  pokemonId: string,
  price: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("🛒 Starting Pokemon purchase:", { studentId, pokemonId, price });

    // Dynamically import the enhanced coin service to avoid circular dependencies
    const { deductCoinsFromStudentEnhanced, awardCoinsToStudentEnhanced } = await import("./enhancedCoinService");

    // --- Step 1: Deduct coins ---
    const coinResult = await deductCoinsFromStudentEnhanced(
      studentId,
      price,
      `Purchased Pokemon: ${pokemonId}`,
      'shop_purchase'
    );

    if (!coinResult.success) {
      console.error("❌ Coin deduction failed:", coinResult.error);
      return { success: false, error: coinResult.error };
    }

    console.log("✅ Coins deducted successfully, now awarding Pokemon...");

    // --- Step 2: Award the Pokemon ---
    const pokemonResult = await awardPokemonToStudent(studentId, pokemonId, 'shop_purchase');

    if (!pokemonResult.success) {
      console.error("❌ Pokemon award failed after coin deduction, attempting refund...");

      // --- Step 3 (Refund): If Pokemon award fails, refund coins ---
      await awardCoinsToStudentEnhanced(
        studentId,
        price,
        `Refund for failed Pokemon purchase: ${pokemonId}`,
        "refund"
      );
      console.log("⚠️ Coins refunded due to failed Pokemon award.");

      return { success: false, error: pokemonResult.error || "Failed to add Pokemon to collection." };
    }

    console.log("✅ Pokemon purchased successfully!");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Error purchasing Pokemon:", error);
    return { success: false, error: `Unexpected error occurred during purchase: ${error.message}` };
  }
};

/**
 * Removes a Pokémon from a student's collection.
 * @param collectionId The ID of the specific collection entry to remove.
 */
export const removePokemonFromStudent = async (collectionId: string): Promise<boolean> => {
  try {
    console.log("🗑️ Removing Pokemon from collection:", collectionId);

    const { error } = await supabase
      .from('pokemon_collections')
      .delete()
      .eq('id', collectionId);

    if (error) {
      console.error("❌ Error removing Pokemon:", error);
      return false;
    }

    console.log("✅ Pokemon removed successfully");
    return true;
  } catch (error: any) {
    console.error("❌ Unexpected error removing Pokemon:", error);
    return false;
  }
};
