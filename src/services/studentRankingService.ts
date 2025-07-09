
import { supabase } from '@/integrations/supabase/client';
import { getStudentPokemonCount } from './unifiedPokemonService';

export interface RankingStudent {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  coins: number;
  pokemon_count: number;
  total_score: number;
  avatar_url?: string;
  class_name?: string;
  school_name?: string;
  rank?: number;
}

export const getStudentRankings = async (schoolId?: string): Promise<RankingStudent[]> => {
  try {
    console.log("🔍 Fetching student rankings for school:", schoolId);

    // Build the query
    let query = supabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        username,
        display_name,
        coins,
        avatar_url,
        school_id,
        class_id,
        school_name
      `);

    // Add school filter if provided
    if (schoolId && schoolId !== 'all') {
      query = query.eq('school_id', schoolId);
    }

    const { data: studentsData, error } = await query.order('coins', { ascending: false });

    if (error) {
      console.error("❌ Error fetching students:", error);
      return [];
    }

    console.log("📦 Found students:", studentsData?.length || 0);

    // Get Pokemon counts for each student using the unified service
    const studentsWithPokemon = await Promise.all((studentsData || []).map(async (student) => {
      const pokemonCount = await getStudentPokemonCount(student.user_id);
      const totalScore = student.coins + (pokemonCount * 3); // Pokemon worth 3 points each

      return {
        ...student,
        pokemon_count: pokemonCount,
        total_score: totalScore,
        class_name: '', // Will be populated if needed
        school_name: student.school_name || '' 
      };
    }));

    // Sort by total score (coins + pokemon value)
    const sortedStudents = studentsWithPokemon.sort((a, b) => b.total_score - a.total_score);

    // Add rank to each student
    const rankedStudents = sortedStudents.map((student, index) => ({
      ...student,
      rank: index + 1
    }));

    console.log("✅ Rankings calculated successfully:", rankedStudents.length);
    return rankedStudents;

  } catch (error) {
    console.error("❌ Error calculating rankings:", error);
    return [];
  }
};

export const getStudentRank = async (studentId: string, schoolId?: string): Promise<number | null> => {
  try {
    const rankings = await getStudentRankings(schoolId);
    const studentRank = rankings.find(student => 
      student.user_id === studentId || student.id === studentId
    );
    
    return studentRank?.rank || null;
  } catch (error) {
    console.error("❌ Error getting student rank:", error);
    return null;
  }
};
