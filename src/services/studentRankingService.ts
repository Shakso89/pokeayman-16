
import { supabase } from '@/integrations/supabase/client';

export interface RankingStudent {
  id: string;
  user_id: string;
  username: string;
  display_name: string; // Changed from optional to required to match usage
  avatar_url?: string;
  coins: number;
  pokemon_count: number;
  total_score: number;
  class_name?: string;
  school_name?: string;
  rank?: number;
}

export interface StudentRanking {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  coins: number;
  pokemonCount: number;
  pokemonValue: number;
  totalScore: number;
  className?: string;
  schoolName?: string;
  rank?: number;
}

export const getStudentRankings = async (): Promise<RankingStudent[]> => {
  try {
    console.log("🔍 Fetching student rankings...");

    // Get all student profiles with their Pokemon counts
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        username,
        display_name,
        avatar_url,
        coins,
        class_id,
        school_id,
        school_name
      `);

    if (profileError) {
      console.error("❌ Error fetching student profiles:", profileError);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      console.log("ℹ️ No student profiles found");
      return [];
    }

    // Get Pokemon counts for all students using the correct table name
    const { data: pokemonCounts, error: pokemonError } = await supabase
      .from('student_pokemon_collection')
      .select('student_id');

    if (pokemonError) {
      console.warn("⚠️ Error fetching Pokemon counts:", pokemonError);
    }

    // Count Pokemon for each student
    const pokemonCountMap = new Map<string, number>();
    if (pokemonCounts) {
      pokemonCounts.forEach(item => {
        const count = pokemonCountMap.get(item.student_id) || 0;
        pokemonCountMap.set(item.student_id, count + 1);
      });
    }

    // Transform the data and calculate rankings
    const rankings: RankingStudent[] = profiles.map(profile => {
      const pokemonCount = pokemonCountMap.get(profile.user_id) || 0;
      const totalScore = (profile.coins || 0) + (pokemonCount * 3);

      return {
        id: profile.id,
        user_id: profile.user_id,
        username: profile.username,
        display_name: profile.display_name || profile.username, // Ensure display_name is always set
        avatar_url: profile.avatar_url,
        coins: profile.coins || 0,
        pokemon_count: pokemonCount,
        total_score: totalScore,
        school_name: profile.school_name
      };
    });

    // Sort by total score (coins + pokemon_count * 3) in descending order
    rankings.sort((a, b) => b.total_score - a.total_score);

    // Add rank numbers
    rankings.forEach((student, index) => {
      student.rank = index + 1;
    });

    console.log("✅ Student rankings calculated:", rankings.length);
    return rankings;

  } catch (error) {
    console.error("❌ Unexpected error fetching student rankings:", error);
    return [];
  }
};

export const calculateGlobalStudentRankings = async (): Promise<StudentRanking[]> => {
  try {
    const rankings = await getStudentRankings();
    
    const transformedRankings: StudentRanking[] = rankings.map(student => ({
      ...student,
      avatarUrl: student.avatar_url,
      displayName: student.display_name,
      pokemonCount: student.pokemon_count,
      pokemonValue: student.pokemon_count * 3,
      totalScore: student.total_score,
      className: student.class_name,
      schoolName: student.school_name
    }));

    return transformedRankings;
  } catch (error) {
    console.error("❌ Error calculating global rankings:", error);
    return [];
  }
};

export const getStudentRank = async (studentId: string): Promise<number> => {
  try {
    const rankings = await getStudentRankings();
    const studentRank = rankings.find(student => student.user_id === studentId);
    return studentRank?.rank || 0;
  } catch (error) {
    console.error("❌ Error getting student rank:", error);
    return 0;
  }
};

export const getClassRankings = async (classId: string): Promise<RankingStudent[]> => {
  try {
    console.log("🔍 Fetching class rankings for class:", classId);

    // Get student profiles for the specific class
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        username,
        display_name,
        avatar_url,
        coins,
        class_id,
        school_id,
        school_name
      `)
      .eq('class_id', classId);

    if (profileError) {
      console.error("❌ Error fetching class student profiles:", profileError);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      console.log("ℹ️ No students found in class");
      return [];
    }

    const studentIds = profiles.map(p => p.user_id);

    // Get Pokemon counts for students in this class using the correct table name
    const { data: pokemonCounts, error: pokemonError } = await supabase
      .from('student_pokemon_collection')
      .select('student_id')
      .in('student_id', studentIds);

    if (pokemonError) {
      console.warn("⚠️ Error fetching Pokemon counts for class:", pokemonError);
    }

    // Count Pokemon for each student
    const pokemonCountMap = new Map<string, number>();
    if (pokemonCounts) {
      pokemonCounts.forEach(item => {
        const count = pokemonCountMap.get(item.student_id) || 0;
        pokemonCountMap.set(item.student_id, count + 1);
      });
    }

    // Transform the data and calculate rankings
    const rankings: RankingStudent[] = profiles.map(profile => {
      const pokemonCount = pokemonCountMap.get(profile.user_id) || 0;
      const totalScore = (profile.coins || 0) + (pokemonCount * 3);

      return {
        id: profile.id,
        user_id: profile.user_id,
        username: profile.username,
        display_name: profile.display_name || profile.username,
        avatar_url: profile.avatar_url,
        coins: profile.coins || 0,
        pokemon_count: pokemonCount,
        total_score: totalScore,
        school_name: profile.school_name
      };
    });

    // Sort by total score in descending order
    rankings.sort((a, b) => b.total_score - a.total_score);

    // Add rank numbers
    rankings.forEach((student, index) => {
      student.rank = index + 1;
    });

    console.log("✅ Class rankings calculated:", rankings.length);
    return rankings;

  } catch (error) {
    console.error("❌ Unexpected error fetching class rankings:", error);
    return [];
  }
};

export const getSchoolRankings = async (schoolId: string): Promise<RankingStudent[]> => {
  try {
    console.log("🔍 Fetching school rankings for school:", schoolId);

    // Get student profiles for the specific school
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        username,
        display_name,
        avatar_url,
        coins,
        class_id,
        school_id,
        school_name
      `)
      .eq('school_id', schoolId);

    if (profileError) {
      console.error("❌ Error fetching school student profiles:", profileError);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      console.log("ℹ️ No students found in school");
      return [];
    }

    const studentIds = profiles.map(p => p.user_id);

    // Get Pokemon counts for students in this school using the correct table name
    const { data: pokemonCounts, error: pokemonError } = await supabase
      .from('student_pokemon_collection')
      .select('student_id')
      .in('student_id', studentIds);

    if (pokemonError) {
      console.warn("⚠️ Error fetching Pokemon counts for school:", pokemonError);
    }

    // Count Pokemon for each student
    const pokemonCountMap = new Map<string, number>();
    if (pokemonCounts) {
      pokemonCounts.forEach(item => {
        const count = pokemonCountMap.get(item.student_id) || 0;
        pokemonCountMap.set(item.student_id, count + 1);
      });
    }

    // Transform the data and calculate rankings
    const rankings: RankingStudent[] = profiles.map(profile => {
      const pokemonCount = pokemonCountMap.get(profile.user_id) || 0;
      const totalScore = (profile.coins || 0) + (pokemonCount * 3);

      return {
        id: profile.id,
        user_id: profile.user_id,
        username: profile.username,
        display_name: profile.display_name || profile.username,
        avatar_url: profile.avatar_url,
        coins: profile.coins || 0,
        pokemon_count: pokemonCount,
        total_score: totalScore,
        school_name: profile.school_name
      };
    });

    // Sort by total score in descending order
    rankings.sort((a, b) => b.total_score - a.total_score);

    // Add rank numbers
    rankings.forEach((student, index) => {
      student.rank = index + 1;
    });

    console.log("✅ School rankings calculated:", rankings.length);
    return rankings;

  } catch (error) {
    console.error("❌ Unexpected error fetching school rankings:", error);
    return [];
  }
};
