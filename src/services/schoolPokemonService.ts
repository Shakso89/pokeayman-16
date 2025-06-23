
import { supabase } from "@/integrations/supabase/client";
import { SchoolPoolPokemon } from "@/types/pokemon";

export const fetchSchoolPokemonPool = async (schoolId: string): Promise<SchoolPoolPokemon[]> => {
  console.log('Fetching Pokemon pool for school:', schoolId);
  
  try {
    const { data, error } = await supabase
      .from('pokemon_pool')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching Pokemon pool:', error);
      throw error;
    }

    if (!data) {
      console.log('No Pokemon pool data found');
      return [];
    }

    console.log('Pokemon pool data:', data);

    // Transform the data to match SchoolPoolPokemon interface
    const transformedData: SchoolPoolPokemon[] = data.map(item => ({
      id: item.id,
      name: item.name,
      image_url: item.image_url || '',
      type_1: item.type_1 || 'normal',
      type_2: item.type_2,
      rarity: item.rarity || 'common',
      price: item.price || 15,
      description: item.description,
      power_stats: item.power_stats
    }));

    return transformedData;
  } catch (error) {
    console.error('Error in fetchSchoolPokemonPool:', error);
    throw error;
  }
};

export const addPokemonToSchoolPool = async (schoolId: string, pokemonData: Omit<SchoolPoolPokemon, 'id'>): Promise<SchoolPoolPokemon | null> => {
  console.log('Adding Pokemon to school pool:', { schoolId, pokemonData });
  
  try {
    const { data, error } = await supabase
      .from('pokemon_pool')
      .insert({
        name: pokemonData.name,
        image_url: pokemonData.image_url,
        type_1: pokemonData.type_1,
        type_2: pokemonData.type_2,
        rarity: pokemonData.rarity,
        price: pokemonData.price,
        description: pokemonData.description,
        power_stats: pokemonData.power_stats
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding Pokemon to pool:', error);
      throw error;
    }

    console.log('Pokemon added to pool:', data);

    // Transform the returned data
    const transformedPokemon: SchoolPoolPokemon = {
      id: data.id,
      name: data.name,
      image_url: data.image_url || '',
      type_1: data.type_1 || 'normal',
      type_2: data.type_2,
      rarity: data.rarity || 'common',
      price: data.price || 15,
      description: data.description,
      power_stats: data.power_stats
    };

    return transformedPokemon;
  } catch (error) {
    console.error('Error in addPokemonToSchoolPool:', error);
    throw error;
  }
};

export const removePokemonFromSchoolPool = async (pokemonId: string): Promise<boolean> => {
  console.log('Removing Pokemon from school pool:', pokemonId);
  
  try {
    const { error } = await supabase
      .from('pokemon_pool')
      .delete()
      .eq('id', pokemonId);

    if (error) {
      console.error('Error removing Pokemon from pool:', error);
      throw error;
    }

    console.log('Pokemon removed from pool successfully');
    return true;
  } catch (error) {
    console.error('Error in removePokemonFromSchoolPool:', error);
    return false;
  }
};

// Add the missing exports that other files are trying to import
export const getSchoolAvailablePokemon = async (schoolId: string): Promise<SchoolPoolPokemon[]> => {
  return fetchSchoolPokemonPool(schoolId);
};

export const assignPokemonFromPool = async (schoolId: string, studentId: string): Promise<boolean> => {
  try {
    console.log('Assigning Pokemon from pool:', { schoolId, studentId });
    
    // Get available Pokemon from pool
    const availablePokemon = await fetchSchoolPokemonPool(schoolId);
    
    if (availablePokemon.length === 0) {
      console.log('No Pokemon available in pool');
      return false;
    }
    
    // Select a random Pokemon
    const randomIndex = Math.floor(Math.random() * availablePokemon.length);
    const selectedPokemon = availablePokemon[randomIndex];
    
    // Add to student's collection
    const { error } = await supabase
      .from('pokemon_collections')
      .insert({
        student_id: studentId,
        pokemon_id: parseInt(selectedPokemon.id),
        school_id: schoolId
      });
    
    if (error) {
      console.error('Error assigning Pokemon:', error);
      return false;
    }
    
    console.log('Pokemon assigned successfully');
    return true;
  } catch (error) {
    console.error('Error in assignPokemonFromPool:', error);
    return false;
  }
};

export const initializeSchoolPokemonPool = async (schoolId: string): Promise<void> => {
  console.log('Initializing Pokemon pool for school:', schoolId);
  // This function can be implemented later if needed
};
