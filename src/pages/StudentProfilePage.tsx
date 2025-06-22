
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Award, Coins, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PokemonList from '@/components/student/PokemonList';
import StudentBadges from '@/components/student/StudentBadges';
import { Pokemon } from '@/types/pokemon';

interface StudentProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  coins: number;
  avatar_url?: string;
  class_name?: string;
  school_name?: string;
  class_id?: string;
  school_id?: string;
}

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [classData, setClassData] = useState<any>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userType = localStorage.getItem("userType") || "teacher";
  const userName = localStorage.getItem(userType === 'teacher' ? 'teacherDisplayName' : 'studentDisplayName') || 'User';

  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log("🔍 Fetching student data for ID:", studentId);

        // First try to get student by user_id, then by id
        let { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', studentId)
          .maybeSingle();

        if (!studentData) {
          const { data: studentById, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .maybeSingle();
          studentData = studentById;
          studentError = error;
        }

        if (studentError && studentError.code !== 'PGRST116') {
          console.error('Error fetching student:', studentError);
        }

        if (!studentData) {
          // Try student_profiles as fallback
          const { data: profileData, error: profileError } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('user_id', studentId)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching student profile:', profileError);
          }

          if (profileData) {
            studentData = {
              ...profileData,
              id: profileData.user_id,
              user_id: profileData.user_id
            };
          }
        }

        if (!studentData) {
          console.log("No student found for ID:", studentId);
          setStudent(null);
          setLoading(false);
          return;
        }

        console.log("✅ Found student data:", studentData);

        // Fetch class and school names
        let className = '';
        let classId = studentData.class_id;
        let schoolName = '';
        let schoolId = studentData.school_id;
        
        if (classId) {
          const { data: classData } = await supabase
            .from('classes')
            .select('name, school_id, star_student_id, top_student_id')
            .eq('id', classId)
            .maybeSingle();
          
          if (classData) {
            className = classData.name;
            schoolId = classData.school_id;
            setClassData(classData);
            
            const { data: schoolData } = await supabase
              .from('schools')
              .select('name, top_student_id')
              .eq('id', classData.school_id)
              .maybeSingle();
            
            if (schoolData) {
              schoolName = schoolData.name;
              setSchoolData(schoolData);
            }
          }
        } else if (schoolId) {
          const { data: schoolData } = await supabase
            .from('schools')
            .select('name, top_student_id')
            .eq('id', schoolId)
            .maybeSingle();
          
          if (schoolData) {
            schoolName = schoolData.name;
            setSchoolData(schoolData);
          }
        }

        setStudent({
          ...studentData,
          class_name: className,
          school_name: schoolName,
          class_id: classId,
          school_id: schoolId
        });

        // Fetch student's Pokemon using the correct user_id
        const lookupId = studentData.user_id || studentData.id;
        console.log("🔍 Fetching Pokemon for user_id:", lookupId);
        
        const { data: pokemonData, error: pokemonError } = await supabase
          .from('pokemon_collections')
          .select(`
            id,
            pokemon_id,
            obtained_at,
            pokemon_catalog (
              id,
              name,
              image,
              type,
              rarity,
              power_stats
            )
          `)
          .eq('student_id', lookupId);

        if (pokemonError) {
          console.error('Error fetching Pokemon:', pokemonError);
        } else {
          console.log("📦 Found Pokemon collections:", pokemonData?.length || 0);
          
          const pokemonList: Pokemon[] = (pokemonData || []).map(collection => {
            const pokemonCatalog = collection.pokemon_catalog as any;
            return {
              id: pokemonCatalog?.id || collection.pokemon_id,
              name: pokemonCatalog?.name || `Pokemon #${collection.pokemon_id}`,
              image: pokemonCatalog?.image || '',
              type: pokemonCatalog?.type || 'normal',
              rarity: pokemonCatalog?.rarity || 'common',
              powerStats: pokemonCatalog?.power_stats || {}
            };
          });

          console.log("✅ Transformed Pokemon list:", pokemonList);
          setPokemons(pokemonList);
        }

      } catch (error) {
        console.error('Error loading student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-xl font-semibold mb-4">Student not found</p>
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
          <h1 className="text-3xl font-bold">Student Profile</h1>
        </div>

        {/* Student Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={student.avatar_url} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <StudentBadges 
                  studentId={student.user_id || student.id}
                  classData={classData}
                  schoolData={schoolData}
                  position="absolute"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.display_name}</h2>
                <p className="text-gray-600">@{student.username}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">{student.coins || 0} Coins</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">{pokemons.length} Pokémon</span>
              </div>
              <div className="flex flex-col gap-1">
                {student.class_name && (
                  <Badge variant="outline" className="w-fit">
                    Class: {student.class_name}
                  </Badge>
                )}
                {student.school_name && (
                  <Badge variant="secondary" className="w-fit">
                    School: {student.school_name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Student Badges Section */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Achievements</span>
              </div>
              <StudentBadges 
                studentId={student.user_id || student.id}
                classData={classData}
                schoolData={schoolData}
                position="relative"
                showContext={true}
                size="lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pokemon Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-purple-500" />
              Pokémon Collection ({pokemons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pokemons.length > 0 ? (
              <PokemonList pokemons={pokemons} />
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No Pokémon in collection yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default StudentProfilePage;
