
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NavBar } from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Trophy, Coins, Award, Crown, Users, School } from 'lucide-react';
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
  is_star_of_class?: boolean;
  is_top_of_school?: boolean;
}

interface ClassRanking {
  id: string;
  name: string;
  total_students: number;
  average_coins: number;
  total_coins: number;
  rank: number;
}

const TeacherRankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [schoolRankings, setSchoolRankings] = useState<RankingStudent[]>([]);
  const [classRankings, setClassRankings] = useState<ClassRanking[]>([]);
  const [loading, setLoading] = useState(true);

  const userType = "teacher";
  const userName = localStorage.getItem("teacherDisplayName") || "Teacher";
  const teacherId = localStorage.getItem("teacherId");
  const schoolId = localStorage.getItem("teacherSchoolId");

  const handleBackClick = () => {
    navigate("/teacher-dashboard");
  };

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        // Fetch school-wide rankings
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

        if (error) throw error;

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
            is_top_of_school: false,
            is_star_of_class: false
          };
        }));

        const sortedStudents = studentsWithPokemon.sort((a, b) => b.total_score - a.total_score);
        
        // Mark top student
        if (sortedStudents.length > 0) {
          sortedStudents[0].is_top_of_school = true;
        }

        setSchoolRankings(sortedStudents.slice(0, 20));

        // Fetch class rankings
        const { data: classesData, error: classError } = await supabase
          .from('classes')
          .select('id, name')
          .eq('school_id', schoolId || 'default-school-1');

        if (classError) throw classError;

        if (classesData && classesData.length > 0) {
          const classesWithStats = await Promise.all(classesData.map(async (classItem) => {
            const { data: classStudents } = await supabase
              .from('student_profiles')
              .select('coins')
              .eq('class_id', classItem.id);

            const students = classStudents || [];
            const totalStudents = students.length;
            const totalCoins = students.reduce((sum, student) => sum + (student.coins || 0), 0);
            const averageCoins = totalStudents > 0 ? Math.round(totalCoins / totalStudents) : 0;

            return {
              id: classItem.id,
              name: classItem.name,
              total_students: totalStudents,
              total_coins: totalCoins,
              average_coins: averageCoins,
              rank: 0
            };
          }));

          const sortedClasses = classesWithStats
            .sort((a, b) => b.average_coins - a.average_coins)
            .map((classItem, index) => ({ ...classItem, rank: index + 1 }));

          setClassRankings(sortedClasses);
        }

      } catch (error) {
        console.error("❌ Error loading rankings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [schoolId, teacherId]);

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
      <NavBar userType={userType} userName={userName} />
      <div className="container mx-auto py-8 max-w-6xl px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-4">
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold">School Rankings</h1>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="students" className="text-base">
              <Users className="mr-2 h-4 w-4" />
              Student Rankings ({schoolRankings.length})
            </TabsTrigger>
            <TabsTrigger value="classes" className="text-base">
              <School className="mr-2 h-4 w-4" />
              Class Rankings ({classRankings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Top Students by Total Score</CardTitle>
              </CardHeader>
              <CardContent>
                {schoolRankings.length > 0 ? (
                  <div className="space-y-3">
                    {schoolRankings.map((student, index) => {
                      const rank = index + 1;
                      return (
                        <div key={student.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                          rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-8">
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
                              <p className="font-semibold text-lg">{student.display_name}</p>
                              <p className="text-sm text-gray-600">@{student.username}</p>
                              <p className="text-xs text-purple-600">{student.pokemon_count} Pokémon</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{student.total_score}</p>
                            <p className="text-sm text-gray-500">total points</p>
                            <p className="text-xs text-gray-400">{student.coins} coins</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No students found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Class Rankings by Average Coins</CardTitle>
              </CardHeader>
              <CardContent>
                {classRankings.length > 0 ? (
                  <div className="space-y-3">
                    {classRankings.map((classItem) => (
                      <div key={classItem.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                        classItem.rank <= 3 ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(classItem.rank)}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{classItem.name}</p>
                            <p className="text-sm text-gray-600">{classItem.total_students} students</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{classItem.average_coins}</p>
                          <p className="text-sm text-gray-500">avg coins</p>
                          <p className="text-xs text-gray-400">({classItem.total_coins} total)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <School className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No classes found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default TeacherRankingPage;
