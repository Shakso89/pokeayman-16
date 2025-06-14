import { supabase } from "@/integrations/supabase/client";
import { Pokemon } from "@/types/pokemon";

export interface StudentProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  teacher_id?: string;
  class_id?: string;
  school_id?: string;
  avatar_url?: string;
  coins: number;
  spent_coins: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  student_id: string;
  type: 'homework_streak' | 'star_of_class' | 'pokemon_master' | 'coin_collector';
  value: number;
  class_id?: string;
  school_id?: string;
  awarded_by?: string;
  awarded_at: string;
  is_active: boolean;
  metadata?: any;
}

export interface StudentClass {
  id: string;
  student_id: string;
  class_id: string;
  assigned_at: string;
}

export interface MysteryBallHistoryRecord {
  id: string;
  student_id: string;
  type: 'pokemon' | 'coins' | 'nothing';
  pokemon_data?: Pokemon;
  coins_amount?: number;
  created_at: string;
}

// Get or create student profile with school assignment
export const getOrCreateStudentProfile = async (
  userId: string,
  username: string,
  displayName?: string,
  schoolId?: string
): Promise<StudentProfile | null> => {
  try {
    // First try to get existing profile
    const { data: existingProfile, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile if it doesn't exist - school_id is required for new students
    if (!schoolId) {
      console.error('School ID is required for new student profiles');
      return null;
    }

    const { data: newProfile, error: createError } = await supabase
      .from('student_profiles')
      .insert({
        user_id: userId,
        username,
        display_name: displayName || username,
        school_id: schoolId,
        coins: 0,
        spent_coins: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating student profile:', createError);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error('Error in getOrCreateStudentProfile:', error);
    return null;
  }
};

// Get student's Pokemon collection
export const getStudentPokemonCollection = async (studentId: string): Promise<Pokemon[]> => {
  try {
    const { data, error } = await supabase
      .from('pokemon_collections')
      .select('*')
      .eq('student_id', studentId)
      .order('obtained_at', { ascending: false });

    if (error) {
      console.error('Error fetching pokemon collection:', error);
      return [];
    }

    return data.map(item => ({
      id: item.pokemon_id,
      name: item.pokemon_name,
      image: item.pokemon_image || '',
      type: item.pokemon_type || '',
      rarity: item.pokemon_rarity as any || 'common'
    }));
  } catch (error) {
    console.error('Error in getStudentPokemonCollection:', error);
    return [];
  }
};

// Assign Pokemon from school pool to student
export const assignPokemonFromSchoolPool = async (
  schoolId: string,
  studentId: string,
  pokemonRarity?: string
): Promise<{ success: boolean; pokemon?: Pokemon; isDuplicate?: boolean }> => {
  try {
    // Get available Pokemon from school pool
    let query = supabase
      .from('pokemon_pools')
      .select('*')
      .eq('school_id', schoolId)
      .eq('available', true);

    if (pokemonRarity) {
      query = query.eq('pokemon_rarity', pokemonRarity);
    }

    const { data: availablePokemon, error: fetchError } = await query.limit(10);

    if (fetchError || !availablePokemon || availablePokemon.length === 0) {
      console.error('No available Pokemon in school pool:', fetchError);
      return { success: false };
    }

    // Randomly select one Pokemon
    const selectedPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
    
    const pokemon: Pokemon = {
      id: selectedPokemon.pokemon_id,
      name: selectedPokemon.pokemon_name,
      image: selectedPokemon.pokemon_image || '',
      type: selectedPokemon.pokemon_type || '',
      rarity: selectedPokemon.pokemon_rarity as any || 'common'
    };

    // Check if student already has this Pokemon
    const { data: existingPokemon } = await supabase
      .from('pokemon_collections')
      .select('id')
      .eq('student_id', studentId)
      .eq('pokemon_id', pokemon.id)
      .maybeSingle();

    if (existingPokemon) {
      // Give coins instead for duplicate (10 coins)
      const success = await updateStudentCoins(studentId, 10);
      return { success, pokemon, isDuplicate: true };
    }

    // Add to student collection
    const { error: addError } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentId,
        pokemon_id: pokemon.id,
        pokemon_name: pokemon.name,
        pokemon_image: pokemon.image,
        pokemon_type: pokemon.type,
        pokemon_rarity: pokemon.rarity,
        pokemon_level: 1
      });

    if (addError) {
      console.error('Error adding pokemon to collection:', addError);
      return { success: false };
    }

    // Mark as assigned in pool
    const { error: updateError } = await supabase
      .from('pokemon_pools')
      .update({ 
        assigned_to: studentId,
        available: false,
        assigned_at: new Date().toISOString()
      })
      .eq('id', selectedPokemon.id);

    if (updateError) {
      console.error('Error updating pool:', updateError);
      return { success: false };
    }

    return { success: true, pokemon, isDuplicate: false };
  } catch (error) {
    console.error('Error in assignPokemonFromSchoolPool:', error);
    return { success: false };
  }
};

// Update student coins
export const updateStudentCoins = async (
  studentId: string,
  coinsToAdd: number,
  spentCoins?: number
): Promise<boolean> => {
  try {
    const { data: currentProfile } = await supabase
      .from('student_profiles')
      .select('coins, spent_coins')
      .eq('id', studentId)
      .single();

    if (!currentProfile) return false;

    const newCoins = Math.max(0, currentProfile.coins + coinsToAdd);
    const newSpentCoins = currentProfile.spent_coins + (spentCoins || 0);

    const { error } = await supabase
      .from('student_profiles')
      .update({
        coins: newCoins,
        spent_coins: newSpentCoins,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId);

    if (error) {
      console.error('Error updating student coins:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateStudentCoins:', error);
    return false;
  }
};

// Get student profile by ID
export const getStudentProfileById = async (studentId: string): Promise<StudentProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getStudentProfileById:', error);
    return null;
  }
};

// Add missing functions
export const addPokemonToCollection = async (
  studentId: string,
  pokemon: Pokemon
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentId,
        pokemon_id: pokemon.id,
        pokemon_name: pokemon.name,
        pokemon_image: pokemon.image,
        pokemon_type: pokemon.type,
        pokemon_rarity: pokemon.rarity,
        pokemon_level: 1
      });

    if (error) {
      console.error('Error adding pokemon to collection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addPokemonToCollection:', error);
    return false;
  }
};

export const assignPokemonFromPool = async (
  schoolId: string,
  studentId: string,
  pokemonId: string
): Promise<{ success: boolean; pokemon?: Pokemon }> => {
  return assignPokemonFromSchoolPool(schoolId, studentId);
};

// Add mystery ball history functions
export const addMysteryBallHistory = async (
  studentId: string,
  type: 'pokemon' | 'coins' | 'nothing',
  pokemon?: Pokemon,
  coinsAmount?: number
): Promise<boolean> => {
  try {
    // Store in localStorage for now (can be moved to database later)
    const historyKey = `mysteryBallHistory_${studentId}`;
    const existingHistory = localStorage.getItem(historyKey);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    const newEntry = {
      id: `${Date.now()}_${Math.random()}`,
      student_id: studentId,
      created_at: new Date().toISOString(),
      type,
      pokemon_data: pokemon,
      coins_amount: coinsAmount
    };
    
    history.unshift(newEntry);
    // Keep only last 50 entries
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error adding mystery ball history:', error);
    return false;
  }
};

export const getMysteryBallHistory = async (studentId: string): Promise<MysteryBallHistoryRecord[]> => {
  try {
    const historyKey = `mysteryBallHistory_${studentId}`;
    const existingHistory = localStorage.getItem(historyKey);
    return existingHistory ? JSON.parse(existingHistory) : [];
  } catch (error) {
    console.error('Error getting mystery ball history:', error);
    return [];
  }
};

export const checkDailyAttempt = async (studentId: string): Promise<boolean> => {
  try {
    const today = new Date().toDateString();
    const lastAttemptKey = `dailyAttempt_${studentId}`;
    const lastAttempt = localStorage.getItem(lastAttemptKey);
    
    return lastAttempt !== today;
  } catch (error) {
    console.error('Error checking daily attempt:', error);
    return false;
  }
};

export const useDailyAttempt = async (studentId: string): Promise<boolean> => {
  try {
    const today = new Date().toDateString();
    const lastAttemptKey = `dailyAttempt_${studentId}`;
    localStorage.setItem(lastAttemptKey, today);
    return true;
  } catch (error) {
    console.error('Error using daily attempt:', error);
    return false;
  }
};

// Get student achievements
export const getStudentAchievements = async (studentId: string): Promise<Achievement[]> => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .order('awarded_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getStudentAchievements:', error);
    return [];
  }
};

// Award star of class
export const awardStarOfClass = async (
  studentId: string,
  classId: string,
  awardedBy: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('award_star_of_class', {
      p_student_id: studentId,
      p_class_id: classId,
      p_awarded_by: awardedBy
    });

    if (error) {
      console.error('Error awarding star of class:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Error in awardStarOfClass:', error);
    return false;
  }
};

// Calculate homework streak
export const calculateHomeworkStreak = async (studentId: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('calculate_homework_streak', {
      p_student_id: studentId
    });

    if (error) {
      console.error('Error calculating homework streak:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error in calculateHomeworkStreak:', error);
    return 0;
  }
};

// Get student's assigned classes
export const getStudentClasses = async (studentId: string): Promise<StudentClass[]> => {
  try {
    const { data, error } = await supabase
      .from('student_classes')
      .select(`
        *,
        classes:class_id (
          id,
          name,
          description
        )
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching student classes:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getStudentClasses:', error);
    return [];
  }
};

// Assign student to class
export const assignStudentToClass = async (
  studentId: string,
  classId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_classes')
      .insert({
        student_id: studentId,
        class_id: classId
      });

    if (error) {
      console.error('Error assigning student to class:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in assignStudentToClass:', error);
    return false;
  }
};

// Get students by school (for rankings)
export const getStudentsBySchool = async (schoolId: string): Promise<StudentProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('school_id', schoolId)
      .order('coins', { ascending: false });

    if (error) {
      console.error('Error fetching students by school:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getStudentsBySchool:', error);
    return [];
  }
};

// Get students by class (for rankings) - fix the return type
export const getStudentsByClass = async (classId: string): Promise<StudentProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('student_classes')
      .select(`
        student_profiles (*)
      `)
      .eq('class_id', classId);

    if (error) {
      console.error('Error fetching students by class:', error);
      return [];
    }

    // Properly handle the nested structure and filter out nulls
    const profiles = data
      .map(item => item.student_profiles)
      .filter((profile): profile is StudentProfile => profile !== null);

    return profiles;
  } catch (error) {
    console.error('Error in getStudentsByClass:', error);
    return [];
  }
};

// Get school Pokemon pool
export const getSchoolPokemonPool = async (schoolId: string): Promise<Pokemon[]> => {
  try {
    const { data, error } = await supabase
      .from('pokemon_pools')
      .select('*')
      .eq('school_id', schoolId)
      .eq('available', true);

    if (error) {
      console.error('Error fetching pokemon pool:', error);
      return [];
    }

    return data.map(item => ({
      id: item.pokemon_id,
      name: item.pokemon_name,
      image: item.pokemon_image || '',
      type: item.pokemon_type || '',
      rarity: item.pokemon_rarity as any || 'common'
    }));
  } catch (error) {
    console.error('Error in getSchoolPokemonPool:', error);
    return [];
  }
};
