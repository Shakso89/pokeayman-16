
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Student, Pokemon } from "@/types/pokemon";
import { Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PokemonList from "@/components/student/PokemonList";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface StudentWithScore {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  pokemonCount: number;
  coins: number;
  totalScore: number;
  rank: number;
}

interface ClassRankingTabProps {
  classId: string;
}

const ClassRankingTab: React.FC<ClassRankingTabProps> = ({ classId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentWithScore[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithScore | null>(null);
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  
  const handleStudentClick = (student: StudentWithScore) => {
    navigate(`/teacher/student/${student.id}`);
  };
  
  useEffect(() => {
    if (classId) {
      loadRankings();
    }
  }, [classId]);
  
  const loadRankings = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('student_profiles')
        .select('id, user_id, display_name, username, avatar_url, coins')
        .eq('class_id', classId);

      if (profilesError) throw profilesError;
      if (!profilesData || profilesData.length === 0) {
        setStudents([]);
        return;
      }

      const profileUserIds = profilesData.map(p => p.user_id);

      const { data: pokemonCollections, error: pokemonError } = await supabase
        .from('pokemon_collections')
        .select('student_id')
        .in('student_id', profileUserIds);

      if (pokemonError) throw pokemonError;

      const pokemonCounts = new Map<string, number>();
      if (pokemonCollections) {
        pokemonCollections.forEach(p => {
          pokemonCounts.set(p.student_id, (pokemonCounts.get(p.student_id) || 0) + 1);
        });
      }

      const studentsWithScore = profilesData.map((p) => {
        const pokemonCount = pokemonCounts.get(p.user_id) || 0;
        const coins = p.coins || 0;
        const totalScore = pokemonCount + Math.floor(coins / 10);
        
        return {
          id: p.user_id,
          displayName: p.display_name || p.username,
          username: p.username,
          avatar: p.avatar_url || undefined,
          pokemonCount,
          coins,
          totalScore,
          rank: 0
        };
      });
      
      const sortedStudents = studentsWithScore.sort((a, b) => b.totalScore - a.totalScore);
      
      const rankedStudents = sortedStudents.map((student, index) => ({
        ...student,
        rank: index + 1
      }));
      
      setStudents(rankedStudents.slice(0, 10));
      
    } catch (error) {
      console.error("Error loading rankings:", error);
      setStudents([]);
    }
  };
  
  const handleStudentRowClick = async (student: StudentWithScore) => {
    setSelectedStudent(student);
    try {
      const { data, error } = await supabase
        .from('pokemon_collections')
        .select('pokemon_id, pokemon_name, pokemon_image, pokemon_type, pokemon_rarity')
        .eq('student_id', student.id);
      
      if (error) throw error;
      
      const pokemons: Pokemon[] = data 
        ? data.map(p => ({
            id: p.pokemon_id!,
            name: p.pokemon_name,
            image: p.pokemon_image || undefined,
            type: p.pokemon_type || 'normal',
            rarity: p.pokemon_rarity || 'common'
          }))
        : [];
      
      setStudentPokemons(pokemons);
    } catch (error) {
      console.error("Error loading student pokemon:", error);
      setStudentPokemons([]);
    }
  };
  
  const getRankingColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-amber-700";
      default:
        return "bg-gray-200";
    }
  };
  
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gray-50 rounded-full p-6 mb-4">
          <Trophy size={48} className="text-gray-400" />
        </div>
        <p className="text-lg font-medium text-gray-500">{t("no-students-found")}</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-6">{t("class-ranking")} - {t("top")} 10</h3>
        
        <div className="space-y-3">
          {students.map(student => (
            <div 
              key={student.id}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleStudentRowClick(student)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getRankingColor(student.rank)}`}>
                {student.rank <= 3 ? <Trophy size={16} /> : student.rank}
              </div>
              
              <div className="ml-3 flex-1 flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>
                    {student.displayName?.substring(0, 2).toUpperCase() || "ST"}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStudentClick(student);
                    }}
                    className="font-medium text-sm text-blue-600 hover:text-blue-800 hover: cursor-pointer"
                  >
                    {student.displayName}
                  </button>
                  <p className="text-xs text-gray-500">@{student.username}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-sm">{student.totalScore} {t("points")}</p>
                <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
                  <span>{student.pokemonCount} {t("pokemon")}</span>
                  <span>•</span>
                  <span>{student.coins} {t("coins")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      {/* Student Pokemon Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.displayName}'s {t("pokemon-collection")}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <PokemonList 
              pokemons={studentPokemons} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClassRankingTab;
