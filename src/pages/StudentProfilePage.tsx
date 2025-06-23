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
import StudentProfilePokemonList from "@/components/student-profile/StudentProfilePokemonList";

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [pokemon, setPokemon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = localStorage.getItem("studentId");
  const userType = localStorage.getItem("userType") as "teacher" | "student";

  useEffect(() => {
    if (studentId) fetchStudentProfile();
  }, [studentId]);

  const fetchStudentProfile = async () => {
    setLoading(true);
    try {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      if (studentError || !studentData) throw studentError;

      const { data: pokemonData } = await supabase
        .from("pokemon_collections")
        .select("*, pokemon_catalog(*)")
        .eq("student_id", studentId);

      const { data: homeworkData } = await supabase
        .from("homework_submissions")
        .select("id")
        .eq("student_id", studentId);

      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*")
        .eq("student_id", studentId);

      const pokemonList = pokemonData?.map(p => ({
        id: p.pokemon_catalog.id,
        name: p.pokemon_catalog.name,
        image: p.pokemon_catalog.image,
        type: p.pokemon_catalog.type,
        rarity: p.pokemon_catalog.rarity,
        powerStats: p.pokemon_catalog.power_stats,
      })) || [];

      setStudent({
        ...studentData,
        displayName: studentData.display_name || studentData.username,
        isOwnProfile: currentUserId === studentData.id,
        pokemonCount: pokemonList.length,
        homeworkCount: homeworkData?.length || 0,
        achievements: achievementsData || []
      });

      setPokemon(pokemonList);
    } catch (err) {
      console.error("Error loading profile:", err);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Loading profile...</div>;
  }

  if (!student) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Student not found.</div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType={userType} userName={student.displayName} />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-bold">{student.isOwnProfile ? "My Profile" : `${student.displayName}'s Profile`}</h1>
          </div>

          {!student.isOwnProfile && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/messages?to=${student.id}`)}>
                <MessageCircle className="h-4 w-4 mr-2" /> Message
              </Button>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" /> Add Friend
              </Button>
            </div>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={student.avatar} />
                <AvatarFallback>{student.displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{student.displayName}</h2>
                <p className="text-sm text-gray-500">@{student.username}</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Badge><Coins className="h-3 w-3 mr-1" /> {student.coins} coins</Badge>
                  <Badge><Trophy className="h-3 w-3 mr-1" /> {student.pokemonCount} Pokémon</Badge>
                  <Badge><Award className="h-3 w-3 mr-1" /> {student.achievements.length} achievements</Badge>
                </div>
              </div>
              <div className="text-sm text-right text-gray-500">
                <p>Joined: {new Date(student.created_at).toLocaleDateString()}</p>
                <p>Score: {student.pokemonCount + student.homeworkCount + Math.floor(student.coins / 10)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="pokemon" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pokemon">Pokémon</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="pokemon">
            <Card>
              <CardHeader><CardTitle>Pokémon Collection ({pokemon.length})</CardTitle></CardHeader>
              <CardContent><StudentProfilePokemonList pokemons={pokemon} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader><CardTitle>Achievements ({student.achievements.length})</CardTitle></CardHeader>
              <CardContent>
                {student.achievements.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {student.achievements.map((ach: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Award className="text-yellow-500 h-5 w-5" />
                          <span className="font-semibold">{ach.type}</span>
                          <Badge>{ach.value} pts</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(ach.awarded_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-center py-8">No achievements yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-3 gap-6">
              <Card><CardHeader><CardTitle>Total Coins</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{student.coins}</CardContent></Card>
              <Card><CardHeader><CardTitle>Pokémon Collected</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{student.pokemonCount}</CardContent></Card>
              <Card><CardHeader><CardTitle>Homework Done</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{student.homeworkCount}</CardContent></Card>
              <Card><CardHeader><CardTitle>Achievements</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{student.achievements.length}</CardContent></Card>
              <Card><CardHeader><CardTitle>Activity Score</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{student.pokemonCount + student.homeworkCount + Math.floor(student.coins / 10)}</CardContent></Card>
              <Card><CardHeader><CardTitle>Days Active</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{Math.floor((Date.now() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24))}</CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfilePage;
