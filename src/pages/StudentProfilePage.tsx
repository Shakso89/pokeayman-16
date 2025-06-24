
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Trophy, Coins, Award, Calendar, School, Users, Loader2 } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import PokemonList from "@/components/student/PokemonList";

interface StudentProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  coins: number;
  school_name?: string;
  class_id?: string;
  created_at: string;
  pokemon_count: number;
  total_score: number;
  rank_in_school?: number;
  achievements: any[];
}

interface Pokemon {
  id: string;
  name: string;
  image_url: string;
  type_1: string;
  type_2?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  price: number;
  description?: string;
  power_stats?: any;
}

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userType = localStorage.getItem("userType") as "teacher" | "student";
  const currentUserId = localStorage.getItem("studentId") || localStorage.getItem("teacherId");
  const userName = localStorage.getItem("studentName") || localStorage.getItem("teacherName") || "User";

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    }
  }, [studentId]);

  const fetchStudentProfile = async () => {
    if (!studentId) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching student profile for ID:", studentId);

      // Get student profile
      const { data: studentData, error: studentError } = await supabase
        .from("student_profiles")
        .select(`
          *,
          schools (name)
        `)
        .eq("user_id", studentId)
        .single();

      if (studentError) {
        console.error("Error fetching student:", studentError);
        throw new Error("Student not found");
      }

      // Get Pokemon collection
      const { data: pokemonData, error: pokemonError } = await supabase
        .from("student_pokemon_collection")
        .select(`
          *,
          pokemon_pool (
            id,
            name,
            image_url,
            type_1,
            type_2,
            rarity,
            price,
            description,
            power_stats
          )
        `)
        .eq("student_id", studentId);

      if (pokemonError) {
        console.warn("Error fetching pokemon:", pokemonError);
      }

      // Transform Pokemon data
      const pokemonList: Pokemon[] = (pokemonData || []).map((item: any) => ({
        id: item.pokemon_pool.id,
        name: item.pokemon_pool.name,
        image_url: item.pokemon_pool.image_url || '',
        type_1: item.pokemon_pool.type_1 || 'normal',
        type_2: item.pokemon_pool.type_2,
        rarity: item.pokemon_pool.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
        price: item.pokemon_pool.price || 0,
        description: item.pokemon_pool.description,
        power_stats: item.pokemon_pool.power_stats
      }));

      // Get achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*")
        .eq("student_id", studentId);

      // Calculate total score and rank
      const pokemonCount = pokemonList.length;
      const totalScore = studentData.coins + (pokemonCount * 3);

      // Get school ranking
      let rankInSchool;
      if (studentData.school_id) {
        const { data: schoolStudents } = await supabase
          .from("student_profiles")
          .select("user_id, coins")
          .eq("school_id", studentData.school_id);

        if (schoolStudents) {
          // Get pokemon counts for all students
          const studentsWithScores = await Promise.all(
            schoolStudents.map(async (s) => {
              const { data: pokemonCount } = await supabase
                .from("student_pokemon_collection")
                .select("id", { count: "exact" })
                .eq("student_id", s.user_id);

              return {
                user_id: s.user_id,
                total_score: s.coins + ((pokemonCount?.length || 0) * 3)
              };
            })
          );

          const sortedStudents = studentsWithScores.sort((a, b) => b.total_score - a.total_score);
          rankInSchool = sortedStudents.findIndex(s => s.user_id === studentId) + 1;
        }
      }

      const profile: StudentProfile = {
        id: studentData.id,
        user_id: studentData.user_id,
        username: studentData.username,
        display_name: studentData.display_name || studentData.username,
        avatar_url: studentData.avatar_url,
        coins: studentData.coins || 0,
        school_name: studentData.schools?.name,
        class_id: studentData.class_id,
        created_at: studentData.created_at,
        pokemon_count: pokemonCount,
        total_score: totalScore,
        rank_in_school: rankInSchool,
        achievements: achievementsData || []
      };

      setStudent(profile);
      setPokemon(pokemonList);

    } catch (err: any) {
      console.error("Error loading student profile:", err);
      setError(err.message || "Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userType={userType} userName={userName} />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userType={userType} userName={userName} />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h1>
            <p className="text-gray-600 mb-4">{error || "Student not found"}</p>
            <Button onClick={handleBackClick}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === student.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userType={userType} userName={userName} />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackClick}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">
              {isOwnProfile ? "My Profile" : `${student.display_name}'s Profile`}
            </h1>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={student.avatar_url || `https://avatar.vercel.sh/${student.username}.png`} />
                <AvatarFallback className="text-2xl">
                  {student.display_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">{student.display_name}</h2>
                <p className="text-xl text-gray-600 mb-4">@{student.username}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                  <Badge className="px-3 py-1 text-base bg-yellow-100 text-yellow-800">
                    <Trophy className="h-4 w-4 mr-1" />
                    {student.rank_in_school ? `#${student.rank_in_school} in school` : 'Unranked'}
                  </Badge>
                  <Badge className="px-3 py-1 text-base bg-green-100 text-green-800">
                    <Coins className="h-4 w-4 mr-1" />
                    {student.coins} coins
                  </Badge>
                  <Badge className="px-3 py-1 text-base bg-blue-100 text-blue-800">
                    <Award className="h-4 w-4 mr-1" />
                    {student.pokemon_count} Pokémon
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  {student.school_name && (
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4" />
                      <span>{student.school_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(student.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>{student.total_score} total points</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Total Coins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{student.coins}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Pokémon Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{student.pokemon_count}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{student.achievements.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="h-4 w-4" />
                School Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {student.rank_in_school ? `#${student.rank_in_school}` : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="pokemon" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pokemon">Pokémon Collection</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="pokemon">
            <Card>
              <CardHeader>
                <CardTitle>Pokémon Collection ({pokemon.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pokemon.length > 0 ? (
                  <PokemonList pokemons={pokemon} />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <img src="/pokeball.png" alt="No Pokémon" className="mx-auto w-24 h-24 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No Pokémon collected yet</p>
                    <p className="text-sm">Start collecting to see your Pokémon here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements ({student.achievements.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {student.achievements.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {student.achievements.map((achievement: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="text-yellow-500 h-6 w-6" />
                          <div>
                            <h3 className="font-semibold text-lg">{achievement.type}</h3>
                            <p className="text-sm text-gray-600">
                              Earned {new Date(achievement.awarded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            +{achievement.value} pts
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Award className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No achievements yet</p>
                    <p className="text-sm">Keep learning and collecting to earn achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Points:</span>
                    <span className="font-semibold">{student.total_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Coins:</span>
                    <span className="font-semibold">{student.coins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pokémon Count:</span>
                    <span className="font-semibold">{student.pokemon_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">School Rank:</span>
                    <span className="font-semibold">
                      {student.rank_in_school ? `#${student.rank_in_school}` : 'Unranked'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-semibold">
                      {new Date(student.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Active:</span>
                    <span className="font-semibold">
                      {Math.floor((Date.now() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Achievements:</span>
                    <span className="font-semibold">{student.achievements.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Collection Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Pokémon:</span>
                    <span className="font-semibold">{student.pokemon_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points from Pokémon:</span>
                    <span className="font-semibold">{student.pokemon_count * 3}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points from Coins:</span>
                    <span className="font-semibold">{student.coins}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfilePage;
