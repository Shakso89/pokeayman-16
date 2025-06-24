
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NavBar } from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Trophy, Coins, Award, Crown } from 'lucide-react';
import AvatarBorder from '@/components/student/profile/AvatarBorder';

interface RankingStudent {
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
  is_star_of_class?: boolean;
  is_top_of_school?: boolean;
}

const StudentRankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<RankingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStudentRank, setCurrentStudentRank] = useState<number | null>(null);

  const userType = localStorage.getItem("userType") || "student";
  const userName = localStorage.getItem("studentDisplayName") || "Student";
  const currentStudentId = localStorage.getItem("studentId");
  const schoolId = localStorage.getItem("studentSchoolId");

  const handleBackClick = () => {
    navigate("/student-dashboard");
  };

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        console.log("🔍 Fetching student rankings...");

        const { data: studentsData, error } = await supabase
          .from('student_profiles')
          .select(`
            id,
            user_id,
            username,
            display_name,
            coins,
            avatar_url,
            school_id,
            class_id
          `)
          .eq('school_id', schoolId || 'default-school-1')
          .order('coins', { ascending: false });

        if (error) {
          console.error("❌ Error fetching students:", error);
          return;
        }

        const studentsWithPokemon = await Promise.all((studentsData || []).map(async (student) => {
          const { data: pokemonData } = await supabase
            .from('pokemon_collections')
            .select('id')
            .eq('student_id', student.user_id);

          const pokemonCount = pokemonData?.length || 0;
          const totalScore = student.coins + (pokemonCount * 3);

          return {
            ...student,
            pokemon_count: pokemonCount,
            total_score: totalScore,
            class_name: '',
            school_name: ''
          };
        }));

        const sortedStudents = studentsWithPokemon.sort((a, b) => b.total_score - a.total_score);
        
        // Add achievement flags
        const studentsWithAchievements = sortedStudents.map((student, index) => ({
          ...student,
          is_top_of_school: index === 0,
          is_star_of_class: false // This would be determined by teacher selection
        }));

        setRankings(studentsWithAchievements);

        const currentRank = studentsWithAchievements.findIndex(student => 
          student.user_id === currentStudentId || student.id === currentStudentId
        );
        
        if (currentRank !== -1) {
          setCurrentStudentRank(currentRank + 1);
        }

        console.log("✅ Rankings loaded successfully:", studentsWithAchievements.length);
      } catch (error) {
        console.error("❌ Error loading rankings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [schoolId, currentStudentId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getAchievementType = (student: RankingStudent) => {
    if (student.is_top_of_school) return "top_of_school";
    if (student.is_star_of_class) return "star_of_class";
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <NavBar userType={userType as "student"} userName={userName} />
      <div className="container mx-auto py-8 max-w-4xl px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-4">
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold">School Rankings</h1>
        </div>

        {currentStudentRank && (
          <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Your Rank</h2>
                <div className="text-4xl font-bold">#{currentStudentRank}</div>
                <p className="text-blue-100 mt-2">Keep collecting Pokémon and coins to climb higher!</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              School Leaderboard
            </CardTitle>
            <p className="text-sm text-gray-600">
              Rankings based on coins + Pokémon collection (each Pokémon = 3 points)
            </p>
          </CardHeader>
          <CardContent>
            {rankings.length > 0 ? (
              <div className="space-y-4">
                {rankings.map((student, index) => {
                  const rank = index + 1;
                  const isCurrentStudent = student.user_id === currentStudentId || student.id === currentStudentId;
                  
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isCurrentStudent 
                          ? 'bg-blue-50 border-blue-200 shadow-md' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(rank)}
                        </div>
                        
                        <AvatarBorder achievement={getAchievementType(student)}>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={student.avatar_url} />
                            <AvatarFallback>
                              {student.display_name?.[0] || student.username?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </AvatarBorder>
                        
                        <div>
                          <h3 className="font-semibold text-lg">
                            {student.display_name || student.username}
                            {isCurrentStudent && (
                              <Badge variant="secondary" className="ml-2">You</Badge>
                            )}
                          </h3>
                          <p className="text-gray-600">@{student.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{student.coins}</span>
                          </div>
                          <p className="text-xs text-gray-500">Coins</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-purple-500" />
                            <span className="font-semibold">{student.pokemon_count}</span>
                          </div>
                          <p className="text-xs text-gray-500">Pokémon</p>
                        </div>
                        
                        <div className="text-center">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getRankBadgeColor(rank)}`}>
                            {student.total_score} pts
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Total</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No rankings available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default StudentRankingPage;
