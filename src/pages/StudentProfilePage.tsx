
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Trophy, Coins, Award, MessageCircle, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Pokemon } from "@/types/pokemon";
import StudentProfilePokemonList from "@/components/student-profile/StudentProfilePokemonList";

interface StudentProfileData {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  coins: number;
  pokemonCount: number;
  homeworkCount: number;
  achievements: any[];
  createdAt: string;
  isOwnProfile: boolean;
}

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfileData | null>(null);
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem("studentId");
  const userType = localStorage.getItem("userType") as "teacher" | "student";

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    }
  }, [studentId]);

  const fetchStudentProfile = async () => {
    if (!studentId) return;

    try {
      setLoading(true);

      // Get student basic info
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      if (studentError) throw studentError;

      // Get student's Pokemon
      const { data: pokemonData, error: pokemonError } = await supabase
        .from("pokemon_collections")
        .select(`
          *,
          pokemon_catalog!inner(*)
        `)
        .eq("student_id", studentId);

      if (pokemonError) throw pokemonError;

      // Transform Pokemon data
      const transformedPokemon: Pokemon[] = (pokemonData || []).map((item: any) => ({
        id: item.pokemon_catalog.id,
        name: item.pokemon_catalog.name,
        image_url: item.pokemon_catalog.image || '',
        type_1: item.pokemon_catalog.type || 'normal',
        type_2: undefined,
        rarity: item.pokemon_catalog.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
        price: 15,
        description: undefined,
        power_stats: item.pokemon_catalog.power_stats
      }));

      // Get homework submissions count
      const { data: homeworkData } = await supabase
        .from("homework_submissions")
        .select("id")
        .eq("student_id", studentId);

      // Get achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*")
        .eq("student_id", studentId);

      setStudent({
        id: studentData.id,
        username: studentData.username,
        displayName: studentData.display_name || studentData.username,
        avatar: studentData.profile_photo,
        coins: studentData.coins || 0,
        pokemonCount: transformedPokemon.length,
        homeworkCount: homeworkData?.length || 0,
        achievements: achievementsData || [],
        createdAt: studentData.created_at,
        isOwnProfile: studentId === currentUserId
      });

      setPokemon(transformedPokemon);
    } catch (error) {
      console.error("Error fetching student profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSendMessage = () => {
    // Navigate to messaging with this student
    navigate(`/messages?to=${student?.id}`);
  };

  const handleAddFriend = () => {
    // Implement friend request functionality
    console.log("Add friend:", student?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <NavBar userType={userType} userName={localStorage.getItem("studentName") || "Student"} />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-transparent">
        <NavBar userType={userType} userName={localStorage.getItem("studentName") || "Student"} />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Student not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType={userType} userName={localStorage.getItem("studentName") || "Student"} />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleBackClick} className="mr-4">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {student.isOwnProfile ? "My Profile" : `${student.displayName}'s Profile`}
            </h1>
          </div>
          
          {!student.isOwnProfile && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSendMessage}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" onClick={handleAddFriend}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={student.avatar} />
                <AvatarFallback className="text-lg">
                  {student.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{student.displayName}</h2>
                <p className="text-gray-500">@{student.username}</p>
                <div className="flex gap-4 mt-2">
                  <Badge variant="outline">
                    <Coins className="h-3 w-3 mr-1" />
                    {student.coins} coins
                  </Badge>
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1" />
                    {student.pokemonCount} Pokemon
                  </Badge>
                  <Badge variant="outline">
                    <Award className="h-3 w-3 mr-1" />
                    {student.achievements.length} achievements
                  </Badge>
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-500">
                <p>Joined: {new Date(student.createdAt).toLocaleDateString()}</p>
                <p>Total Score: {student.pokemonCount + student.homeworkCount + Math.floor(student.coins / 10)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="pokemon" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pokemon">Pokemon Collection</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="pokemon">
            <Card>
              <CardHeader>
                <CardTitle>Pokemon Collection ({pokemon.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <StudentProfilePokemonList pokemons={pokemon} />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.achievements.map((achievement, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-500" />
                          <h3 className="font-semibold">{achievement.type}</h3>
                          <Badge variant="outline">{achievement.value} points</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Awarded on {new Date(achievement.awarded_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No achievements yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Coins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.coins}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Pokemon Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.pokemonCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Homework Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.homeworkCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{student.achievements.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Activity Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {student.pokemonCount + student.homeworkCount + Math.floor(student.coins / 10)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Days Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor((new Date().getTime() - new Date(student.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
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
