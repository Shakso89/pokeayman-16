
import { supabase } from '@/integrations/supabase/client';

export interface RankingStudent {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  coins: number;
  pokemon_count: number;
  total_score: number;
  school_id?: string;
  school_name?: string;
  rank?: number;
}

// Export alias for backward compatibility
export type StudentRanking = RankingStudent & {
  avatarUrl?: string;
  displayName: string;
  pokemonCount: number;
  pokemonValue: number;
  totalScore: number;
  schoolName?: string;
};

export const getStudentRankings = async (schoolId?: string): Promise<RankingStudent[]> => {
  try {
    console.log("🏆 Fetching student rankings...", schoolId ? `for school: ${schoolId}` : "globally");

    // Build the query with Pokemon count from student_pokemon_collection
    let query = supabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        username,
        display_name,
        avatar_url,
        coins,
        school_id,
        school_name,
        student_pokemon_collection!inner(id)
      `);

    // Add school filter if provided
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error("❌ Error fetching student profiles:", error);
      return [];
    }

    if (!profiles) {
      console.log("📭 No students found");
      return [];
    }

    // Calculate rankings with Pokemon counts
    const rankings: RankingStudent[] = profiles.map(profile => {
      const pokemonCount = profile.student_pokemon_collection?.length || 0;
      const totalScore = profile.coins + (pokemonCount * 3);

      return {
        id: profile.id,
        user_id: profile.user_id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        coins: profile.coins || 0,
        pokemon_count: pokemonCount,
        total_score: totalScore,
        school_id: profile.school_id,
        school_name: profile.school_name
      };
    });

    // Sort by total score descending and assign ranks
    const sortedRankings = rankings
      .sort((a, b) => b.total_score - a.total_score)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    console.log("✅ Student rankings calculated:", sortedRankings.length);
    return sortedRankings;

  } catch (error) {
    console.error("❌ Unexpected error fetching student rankings:", error);
    return [];
  }
};

export const calculateGlobalStudentRankings = async (): Promise<StudentRanking[]> => {
  try {
    console.log("🏆 Calculating global student rankings...");
    
    const rankings = await getStudentRankings(); // Get all students (no school filter)
    
    // Transform to StudentRanking format for backward compatibility
    const transformedRankings: StudentRanking[] = rankings.map(student => ({
      ...student,
      avatarUrl: student.avatar_url,
      displayName: student.display_name || student.username,
      pokemonCount: student.pokemon_count,
      pokemonValue: student.pokemon_count * 3,
      totalScore: student.total_score,
      schoolName: student.school_name
    }));

    console.log("✅ Global rankings calculated:", transformedRankings.length);
    return transformedRankings;
  } catch (error) {
    console.error("❌ Error calculating global rankings:", error);
    return [];
  }
};

export const getStudentRank = async (studentId: string, schoolId?: string): Promise<number | null> => {
  try {
    const rankings = await getStudentRankings(schoolId);
    const student = rankings.find(s => s.user_id === studentId || s.id === studentId);
    return student?.rank || null;
  } catch (error) {
    console.error("❌ Error getting student rank:", error);
    return null;
  }
};

export const getSchoolTopStudents = async (schoolId: string, limit: number = 10): Promise<RankingStudent[]> => {
  try {
    const rankings = await getStudentRankings(schoolId);
    return rankings.slice(0, limit);
  } catch (error) {
    console.error("❌ Error getting school top students:", error);
    return [];
  }
};

// Get Pokemon count for a specific student
export const getStudentPokemonCount = async (studentId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('student_pokemon_collection')
      .select('id')
      .eq('student_id', studentId);

    if (error) {
      console.error("❌ Error fetching Pokemon count:", error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error("❌ Unexpected error fetching Pokemon count:", error);
    return 0;
  }
};
