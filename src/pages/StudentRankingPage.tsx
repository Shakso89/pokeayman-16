
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Crown, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StudentRanking {
  id: string;
  display_name: string;
  username: string;
  coins: number;
  pokemon_count: number;
  total_score: number;
  avatar_url?: string;
  school_name?: string;
  achievement?: "star_of_class" | "top_of_school" | null;
}

const StudentRankingPage: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const studentId = localStorage.getItem("studentId");
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      loadRankings();
    }
  }, [studentId]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      
      // Get all students with their Pokemon counts
      const { data: students, error: studentsError } = await supabase
        .from("student_profiles")
        .select("*");

      if (studentsError) throw studentsError;

      if (students) {
        // Get Pokemon counts for each student
        const studentsWithPokemon = await Promise.all(
          students.map(async (student) => {
            const { data: pokemonData } = await supabase
              .from("student_pokemon_collection")
              .select("id")
              .eq("student_id", student.user_id);

            const pokemonCount = pokemonData?.length || 0;
            const totalScore = (student.coins || 0) + (pokemonCount * 3);

            return {
              id: student.user_id,
              display_name: student.display_name || student.username,
              username: student.username,
              coins: student.coins || 0,
              pokemon_count: pokemonCount,
              total_score: totalScore,
              avatar_url: student.avatar_url,
              school_name: student.school_name,
              achievement: null // This would be determined by ranking logic
            };
          })
        );

        // Sort by total score
        studentsWithPokemon.sort((a, b) => b.total_score - a.total_score);

        // Add achievements for top performers
        if (studentsWithPokemon.length > 0) {
          studentsWithPokemon[0].achievement = "top_of_school";
        }

        setRankings(studentsWithPokemon);
      }
    } catch (error) {
      console.error("Error loading rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-6 w-6 text-gray-300" />;
    }
  };

  const getAchievementBadge = (achievement: string | null) => {
    switch (achievement) {
      case "star_of_class":
        return <Badge className="bg-blue-500"><Star className="h-3 w-3 mr-1" />Star of Class</Badge>;
      case "top_of_school":
        return <Badge className="bg-purple-600"><Crown className="h-3 w-3 mr-1" />Top of School</Badge>;
      default:
        return null;
    }
  };

  if (!isLoggedIn || userType !== "student") {
    return <Navigate to="/student-login" />;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <NavBar userType="student" userName={localStorage.getItem("studentName") || "Student"} />
      
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Student Rankings
            </CardTitle>
          </CardHeader>
        </Card>

        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading rankings...</p>
          </div>
        ) : rankings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No rankings available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rankings.map((student, index) => (
              <Card key={student.id} className={`${index < 3 ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50' : ''} ${student.id === studentId ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index + 1)}
                        <span className="font-bold text-2xl">#{index + 1}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          {student.avatar_url ? (
                            <img src={student.avatar_url} alt={student.display_name} className="w-12 h-12 rounded-full" />
                          ) : (
                            <span className="text-lg font-bold">{student.display_name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg">{student.display_name}</h3>
                          <p className="text-sm text-gray-500">@{student.username}</p>
                          {student.school_name && (
                            <p className="text-xs text-gray-400">{student.school_name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-4 mb-2">
                        <Badge variant="outline">{student.coins} coins</Badge>
                        <Badge variant="outline">{student.pokemon_count} Pokémon</Badge>
                        <Badge className="bg-green-600 text-white font-bold">
                          {student.total_score} pts
                        </Badge>
                      </div>
                      {getAchievementBadge(student.achievement)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRankingPage;
