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
  const [loading, setLoading] = useState(false);

  const handleStudentClick = (student: StudentWithScore) => {
    navigate(`/teacher/student/${student.id}`);
  };

  useEffect(() => {
    const fetchClassRanking = async () => {
      if (!classId) return;
      
      setLoading(true);
      try {
        console.log('Fetching class ranking for class:', classId);
        
        // Get students in this class
        const { data: studentClassData, error: studentClassError } = await supabase
          .from('student_classes')
          .select('student_id')
          .eq('class_id', classId);

        if (studentClassError) {
          console.error('Error fetching student class data:', studentClassError);
          return;
        }

        const studentIds = studentClassData?.map(sc => sc.student_id) || [];
        
        if (studentIds.length === 0) {
          setStudents([]);
          return;
        }

        // Get student data
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, username, display_name, coins')
          .in('id', studentIds)
          .eq('is_active', true);

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          return;
        }

        // Get Pokemon counts for each student
        const studentsWithCounts = await Promise.all(
          (studentsData || []).map(async (student) => {
            const { data: pokemonData } = await supabase
              .from('pokemon_collections')
              .select('*, pokemon_catalog!inner(*)')
              .eq('student_id', student.id);

            const transformedPokemons: Pokemon[] = (pokemonData || []).map((item: any) => ({
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

            return {
              id: student.id,
              name: student.display_name || student.username,
              username: student.username,
              displayName: student.display_name || student.username,
              coins: student.coins || 0,
              pokemonCount: transformedPokemons.length,
              pokemons: transformedPokemons,
              rank: 0
            };
          })
        );

        // Sort by Pokemon count (descending) and assign ranks
        const sortedStudents = studentsWithCounts
          .sort((a, b) => b.pokemonCount - a.pokemonCount)
          .map((student, index) => ({
            ...student,
            rank: index + 1
          }));

        setStudents(sortedStudents);
      } catch (error) {
        console.error('Error fetching class ranking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassRanking();
  }, [classId]);

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
