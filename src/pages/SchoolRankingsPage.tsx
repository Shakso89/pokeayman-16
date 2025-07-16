import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Trophy, Users, Star, Medal } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface StudentRanking {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  coins: number;
  rank: number;
  class_name?: string;
  pokemon_count: number;
}

interface ClassRanking {
  id: string;
  name: string;
  total_students: number;
  average_coins: number;
  total_coins: number;
  rank: number;
}

const SchoolRankingsPage: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [school, setSchool] = useState<any>(null);
  const [studentRankings, setStudentRankings] = useState<StudentRanking[]>([]);
  const [classRankings, setClassRankings] = useState<ClassRanking[]>([]);
  const [loading, setLoading] = useState(true);

  const userType = localStorage.getItem("userType") || "teacher";
  const userName = localStorage.getItem(userType === 'teacher' ? 'teacherDisplayName' : 'studentDisplayName') || 'User';

  const handleStudentClick = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log("📊 Fetching rankings data for school:", schoolId);

        // Fetch school details
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('id, name')
          .eq('id', schoolId)
          .single();

        if (schoolError) throw schoolError;
        setSchool(schoolData);
        console.log("🏫 School data:", schoolData);

        // Fetch student rankings from student_profiles table
        console.log("👥 Fetching student profiles for school:", schoolId);
        const { data: studentsData, error: studentsError } = await supabase
          .from('student_profiles')
          .select(`
            id,
            user_id,
            username,
            display_name,
            coins,
            class_id
          `)
          .eq('school_id', schoolId)
          .order('coins', { ascending: false });

        if (studentsError) {
          console.error("❌ Error fetching students:", studentsError);
          throw studentsError;
        }

        console.log("📋 Students data found:", studentsData?.length || 0);

        if (!studentsData || studentsData.length === 0) {
          console.log("⚠️ No students found for school:", schoolId);
          setStudentRankings([]);
        } else {
          // Get class names and pokemon counts for each student
          const studentIds = studentsData.map(s => s.user_id);
          const classIds = [...new Set(studentsData.map(s => s.class_id).filter(Boolean))];

          console.log("🎯 Student IDs for Pokemon count:", studentIds.length);
          console.log("📚 Class IDs for names:", classIds.length);

          // Fetch class names
          let classNamesMap = new Map();
          if (classIds.length > 0) {
            const { data: classesData } = await supabase
              .from('classes')
              .select('id, name')
              .in('id', classIds);

            if (classesData) {
              classesData.forEach(cls => classNamesMap.set(cls.id, cls.name));
              console.log("📝 Class names loaded:", classesData.length);
            }
          }

          // Fetch pokemon counts from the correct table: student_pokemon_collection
          let pokemonCountMap = new Map();
          if (studentIds.length > 0) {
            const { data: pokemonCounts } = await supabase
              .from('student_pokemon_collection')
              .select('student_id')
              .in('student_id', studentIds);

            if (pokemonCounts) {
              pokemonCounts.forEach(p => {
                pokemonCountMap.set(p.student_id, (pokemonCountMap.get(p.student_id) || 0) + 1);
              });
              console.log("🎮 Pokemon counts loaded for students:", pokemonCountMap.size);
            }
          }

          const studentsWithRank = studentsData.map((student, index) => ({
            id: student.id,
            user_id: student.user_id,
            username: student.username,
            display_name: student.display_name || student.username,
            coins: student.coins || 0,
            rank: index + 1,
            class_name: student.class_id ? classNamesMap.get(student.class_id) || 'No Class' : 'No Class',
            pokemon_count: pokemonCountMap.get(student.user_id) || 0
          }));

          console.log("🏆 Student rankings prepared:", studentsWithRank.length);
          setStudentRankings(studentsWithRank);
        }

        // Fetch class rankings
        console.log("📊 Fetching class rankings for school:", schoolId);
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select(`
            id,
            name
          `)
          .eq('school_id', schoolId);

        if (classesError) throw classesError;

        if (classesData && classesData.length > 0) {
          console.log("📚 Found classes for ranking:", classesData.length);
          
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

          console.log("🏆 Class rankings prepared:", sortedClasses.length);
          setClassRankings(sortedClasses);
        } else {
          console.log("⚠️ No classes found for school:", schoolId);
          setClassRankings([]);
        }

      } catch (error) {
        console.error('❌ Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-xl font-semibold mb-4">School not found</p>
            <Button onClick={handleBackClick}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <AppHeader userType={userType as "student" | "teacher"} userName={userName} />
      <div className="container mx-auto py-8 max-w-6xl px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-4">
            <ArrowLeft />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">{school.name} Rankings</h1>
          </div>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="students" className="text-base">
              <Users className="mr-2 h-4 w-4" />
              Student Rankings ({studentRankings.length})
            </TabsTrigger>
            <TabsTrigger value="classes" className="text-base">
              <Star className="mr-2 h-4 w-4" />
              Class Rankings ({classRankings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Top Students by Coins</CardTitle>
              </CardHeader>
              <CardContent>
                {studentRankings.length > 0 ? (
                  <div className="space-y-3">
                    {studentRankings.map((student) => (
                      <div key={student.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                        student.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(student.rank)}
                          </div>
                          <div>
                            <button
                              onClick={() => handleStudentClick(student.user_id)}
                              className="font-semibold text-lg text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {student.display_name}
                            </button>
                            <p className="text-sm text-gray-600">@{student.username}</p>
                            <p className="text-xs text-gray-500">{student.class_name}</p>
                            <p className="text-xs text-purple-600">{student.pokemon_count} Pokémon</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{student.coins}</p>
                          <p className="text-sm text-gray-500">coins</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No students found in this school</p>
                    <p className="text-sm">Students will appear here once they join classes in this school.</p>
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
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No classes found in this school</p>
                    <p className="text-sm">Classes will appear here once they are created in this school.</p>
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

export default SchoolRankingsPage;
