
import { supabase } from "@/integrations/supabase/client";
import { SchoolPokemonPool } from "@/types/user";
import { Pokemon } from "@/types/pokemon";

// Get school's Pokemon pool
export const getSchoolPokemonPool = async (schoolId: string): Promise<SchoolPokemonPool[]> => {
  try {
    const { data, error } = await supabase
      .from('pokemon_pools')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
      console.error('Error fetching Pokemon pool:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      schoolId: item.school_id,
      pokemonId: item.pokemon_id,
      isAssigned: item.is_assigned || false,
      assignedTo: item.assigned_to,
      assignedAt: item.assigned_at
    }));
  } catch (error) {
    console.error('Error fetching Pokemon pool:', error);
    return [];
  }
};

// Assign Pokemon to user
export const assignPokemonToUser = async (
  poolId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pokemon_pools')
      .update({
        is_assigned: true,
        assigned_to: userId,
        assigned_at: new Date().toISOString()
      })
      .eq('id', poolId);

    if (error) {
      console.error('Error assigning Pokemon:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error assigning Pokemon:', error);
    return false;
  }
};

// Unassign Pokemon from user
export const unassignPokemonFromUser = async (poolId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pokemon_pools')
      .update({
        is_assigned: false,
        assigned_to: null,
        assigned_at: null
      })
      .eq('id', poolId);

    if (error) {
      console.error('Error unassigning Pokemon:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error unassigning Pokemon:', error);
    return false;
  }
};

// Get user's assigned Pokemon
export const getUserAssignedPokemon = async (userId: string): Promise<Pokemon[]> => {
  try {
    const { data, error } = await supabase
      .from('pokemon_pools')
      .select(`
        pokemon_catalog!inner(*)
      `)
      .eq('assigned_to', userId)
      .eq('is_assigned', true);

    if (error) {
      console.error('Error fetching user Pokemon:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.pokemon_catalog.id,
      name: item.pokemon_catalog.name,
      image: item.pokemon_catalog.image || '',
      type: item.pokemon_catalog.type || '',
      rarity: item.pokemon_catalog.rarity as any || 'common',
      powerStats: item.pokemon_catalog.power_stats
    }));
  } catch (error) {
    console.error('Error fetching user Pokemon:', error);
    return [];
  }
};
