
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
  username: string;
  display_name: string;
  coins: number;
  rank: number;
  class_name?: string;
}

interface ClassRanking {
  id: string;
  name: string;
  total_students: number;
  average_coins: number;
  total_coins: number;
  rank: number;
}

interface ClassData {
  id: string;
  name: string;
  student_profiles: Array<{ coins: number }>;
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

  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch school details
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('id, name')
          .eq('id', schoolId)
          .single();

        if (schoolError) throw schoolError;
        setSchool(schoolData);

        // Fetch student rankings
        const { data: studentsData, error: studentsError } = await supabase
          .from('student_profiles')
          .select(`
            id,
            username,
            display_name,
            coins,
            class_id,
            classes(name)
          `)
          .eq('school_id', schoolId)
          .order('coins', { ascending: false });

        if (studentsError) throw studentsError;

        const studentsWithRank = (studentsData || []).map((student, index) => ({
          id: student.id,
          username: student.username,
          display_name: student.display_name || student.username,
          coins: student.coins,
          rank: index + 1,
          class_name: (student.classes as any)?.name || 'No Class'
        }));

        setStudentRankings(studentsWithRank);

        // Fetch class rankings
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            student_profiles(coins)
          `)
          .eq('school_id', schoolId);

        if (classesError) throw classesError;

        const classesWithStats = (classesData as ClassData[] || []).map((classItem) => {
          const students = classItem.student_profiles || [];
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
        }).sort((a, b) => b.average_coins - a.average_coins)
          .map((classItem, index) => ({ ...classItem, rank: index + 1 }));

        setClassRankings(classesWithStats);

      } catch (error) {
        console.error('Error fetching rankings:', error);
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
            <Button onClick={() => navigate(-1)}>
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-4">
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
              Student Rankings
            </TabsTrigger>
            <TabsTrigger value="classes" className="text-base">
              <Star className="mr-2 h-4 w-4" />
              Class Rankings
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
                            <p className="font-semibold text-lg">{student.display_name}</p>
                            <p className="text-sm text-gray-600">@{student.username}</p>
                            <p className="text-xs text-gray-500">{student.class_name}</p>
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
                  <p className="text-center text-gray-500 py-8">No students found in this school.</p>
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
                  <p className="text-center text-gray-500 py-8">No classes found in this school.</p>
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
