
import { supabase } from "@/integrations/supabase/client";
import { calculatePokemonValue } from "./pokemonValueService";

export interface StudentRanking {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  schoolName?: string;
  coins: number;
  pokemonCount: number;
  pokemonValue: number;
  totalScore: number;
  rank: number;
}

export interface PokemonCollectionValue {
  studentId: string;
  totalValue: number;
  pokemonCount: number;
}

export const calculateStudentPokemonValue = async (studentId: string): Promise<PokemonCollectionValue> => {
  try {
    const { data: collection, error } = await supabase
      .from('student_pokemon_collection')
      .select(`
        pokemon_pool (
          id,
          name,
          rarity,
          price
        )
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching student pokemon:', error);
      return { studentId, totalValue: 0, pokemonCount: 0 };
    }

    let totalValue = 0;
    const pokemonCount = collection?.length || 0;

    (collection || []).forEach((item: any) => {
      if (item.pokemon_pool) {
        const pokemon = item.pokemon_pool;
        const value = pokemon.price || calculatePokemonValue(pokemon.rarity);
        totalValue += value;
      }
    });

    return {
      studentId,
      totalValue,
      pokemonCount
    };
  } catch (error) {
    console.error('Error calculating pokemon value for student:', studentId, error);
    return { studentId, totalValue: 0, pokemonCount: 0 };
  }
};

export const calculateGlobalStudentRankings = async (): Promise<StudentRanking[]> => {
  try {
    console.log('Fetching global student rankings...');

    // Fetch all student profiles
    const { data: students, error: studentsError } = await supabase
      .from('student_profiles')
      .select(`
        user_id,
        username,
        display_name,
        avatar_url,
        school_name,
        coins
      `);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return [];
    }

    if (!students || students.length === 0) {
      console.log('No students found');
      return [];
    }

    console.log(`Found ${students.length} students`);

    // Calculate pokemon values for all students
    const studentRankings = await Promise.all(
      students.map(async (student) => {
        const pokemonData = await calculateStudentPokemonValue(student.user_id);
        
        // Calculate total score: coins + pokemon value
        const totalScore = (student.coins || 0) + pokemonData.totalValue;
        
        return {
          id: student.user_id,
          username: student.username,
          displayName: student.display_name || student.username,
          avatarUrl: student.avatar_url,
          schoolName: student.school_name,
          coins: student.coins || 0,
          pokemonCount: pokemonData.pokemonCount,
          pokemonValue: pokemonData.totalValue,
          totalScore,
          rank: 0 // Will be set after sorting
        };
      })
    );

    // Sort by total score (descending) and assign ranks
    const sortedRankings = studentRankings
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    console.log(`Calculated rankings for ${sortedRankings.length} students`);
    return sortedRankings;
  } catch (error) {
    console.error('Error calculating global rankings:', error);
    return [];
  }
};

export const getTopStudents = async (limit: number = 10): Promise<StudentRanking[]> => {
  const allRankings = await calculateGlobalStudentRankings();
  return allRankings.slice(0, limit);
};

export const getStudentRank = async (studentId: string): Promise<StudentRanking | null> => {
  const allRankings = await calculateGlobalStudentRankings();
  return allRankings.find(ranking => ranking.id === studentId) || null;
};
