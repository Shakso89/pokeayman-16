
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

  const userType = localStorage.getItem("userType") || "student";
  const userName = localStorage.getItem(userType === 'teacher' ? 'teacherDisplayName' : 'studentDisplayName') || 'User';

  const handleBackClick = () => {
    // Navigate back to student dashboard for students
    if (userType === "student") {
      navigate("/student-dashboard");
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        console.error("No studentId provided");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log("🔍 Fetching student data for ID:", studentId);

        // First, determine the correct lookup strategy
        let studentData = null;
        let lookupUserId = studentId;

        // Try to get student by user_id first (most common case for student profiles)
        const { data: studentByUserId, error: userIdError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', studentId)
          .maybeSingle();

        if (studentByUserId) {
          studentData = studentByUserId;
          lookupUserId = studentByUserId.user_id;
          console.log("✅ Found student by user_id:", studentData);
        } else {
          // Try by student ID
          const { data: studentById, error: idError } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .maybeSingle();

          if (studentById) {
            studentData = studentById;
            lookupUserId = studentById.user_id || studentById.id;
            console.log("✅ Found student by id:", studentData);
          }
        }

        // If no student found in students table, try student_profiles
        if (!studentData) {
          const { data: profileData, error: profileError } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('user_id', studentId)
            .maybeSingle();

          if (profileData) {
            studentData = {
              ...profileData,
              id: profileData.user_id,
              user_id: profileData.user_id
            };
            lookupUserId = profileData.user_id;
            console.log("✅ Found student in student_profiles:", studentData);
          }
        }

        if (!studentData) {
          console.log("❌ No student found for ID:", studentId);
          setStudent(null);
          setLoading(false);
          return;
        }

        // Fetch class and school information
        let className = '';
        let classId = studentData.class_id;
        let schoolName = '';
        let schoolId = studentData.school_id;
        
        if (classId) {
          const { data: classInfo } = await supabase
            .from('classes')
            .select('name, school_id, star_student_id, top_student_id')
            .eq('id', classId)
            .maybeSingle();
          
          if (classInfo) {
            className = classInfo.name;
            schoolId = classInfo.school_id;
            setClassData(classInfo);
            
            const { data: schoolInfo } = await supabase
              .from('schools')
              .select('name, top_student_id')
              .eq('id', classInfo.school_id)
              .maybeSingle();
            
            if (schoolInfo) {
              schoolName = schoolInfo.name;
              setSchoolData(schoolInfo);
            }
          }
        } else if (schoolId) {
          const { data: schoolInfo } = await supabase
            .from('schools')
            .select('name, top_student_id')
            .eq('id', schoolId)
            .maybeSingle();
          
          if (schoolInfo) {
            schoolName = schoolInfo.name;
            setSchoolData(schoolInfo);
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
        console.log("🔍 Fetching Pokemon for user_id:", lookupUserId);
        
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
          .eq('student_id', lookupUserId);

        if (pokemonError) {
          console.error('❌ Error fetching Pokemon:', pokemonError);
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
        console.error('❌ Error loading student data:', error);
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
                <p className="text-sm text-gray-400 mt-2">Complete homework or use the Mystery Ball to get your first Pokémon!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default StudentProfilePage;
