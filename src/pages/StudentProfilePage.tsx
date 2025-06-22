
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
}

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
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
        // Fetch student profile
        const { data: profileData, error: profileError } = await supabase
          .from('student_profiles')
          .select(`
            id,
            user_id,
            username,
            display_name,
            coins,
            avatar_url,
            class_id,
            school_id
          `)
          .eq('user_id', studentId)
          .single();

        if (profileError) throw profileError;

        if (!profileData) {
          console.log("No student profile found for ID:", studentId);
          setStudent(null);
          setLoading(false);
          return;
        }

        // Fetch class and school names
        let className = '';
        let schoolName = '';
        
        if (profileData.class_id) {
          const { data: classData } = await supabase
            .from('classes')
            .select('name, school_id')
            .eq('id', profileData.class_id)
            .single();
          
          if (classData) {
            className = classData.name;
            
            const { data: schoolData } = await supabase
              .from('schools')
              .select('name')
              .eq('id', classData.school_id)
              .single();
            
            if (schoolData) {
              schoolName = schoolData.name;
            }
          }
        } else if (profileData.school_id) {
          const { data: schoolData } = await supabase
            .from('schools')
            .select('name')
            .eq('id', profileData.school_id)
            .single();
          
          if (schoolData) {
            schoolName = schoolData.name;
          }
        }

        setStudent({
          ...profileData,
          class_name: className,
          school_name: schoolName
        });

        // Fetch student's Pokemon
        const { data: pokemonData, error: pokemonError } = await supabase
          .from('pokemon_collections')
          .select('pokemon_id, pokemon_name, pokemon_image, pokemon_type, pokemon_rarity')
          .eq('student_id', studentId);

        if (pokemonError) throw pokemonError;

        const pokemonList: Pokemon[] = (pokemonData || []).map(p => ({
          id: p.pokemon_id!,
          name: p.pokemon_name,
          image: p.pokemon_image || undefined,
          type: p.pokemon_type || 'normal',
          rarity: p.pokemon_rarity || 'common'
        }));

        setPokemons(pokemonList);

      } catch (error) {
        console.error('Error fetching student data:', error);
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
              <Avatar className="h-16 w-16">
                <AvatarImage src={student.avatar_url} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
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
                <span className="font-semibold">{student.coins} Coins</span>
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
