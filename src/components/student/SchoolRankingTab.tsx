
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Student, Pokemon } from "@/types/pokemon";
import { Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PokemonList from "@/components/student/PokemonList";
import { Card, CardContent } from "@/components/ui/card";

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

interface SchoolRankingTabProps {
  schoolId: string;
}

const SchoolRankingTab: React.FC<SchoolRankingTabProps> = ({ schoolId }) => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<StudentWithScore[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithScore | null>(null);
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  
  useEffect(() => {
    loadRankings();
  }, [schoolId]);
  
  const loadRankings = () => {
    try {
      // Load all students in this school
      const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
      const schoolStudents = allStudents.filter((s: Student) => s.schoolId === schoolId);
      
      console.log("School students for ranking:", schoolStudents);
      
      // Get Pokemon counts and coins for each student
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      
      const studentsWithScore = schoolStudents.map((s: Student) => {
        const pokemonData = studentPokemons.find((p: any) => p.studentId === s.id);
        const pokemonCount = pokemonData ? (pokemonData.pokemons || []).length : 0;
        const coins = pokemonData ? pokemonData.coins : 0;
        
        // Calculate total score (pokemon count + coins/10)
        const totalScore = pokemonCount + Math.floor(coins / 10);
        
        return {
          id: s.id,
          displayName: s.displayName,
          username: s.username,
          avatar: s.avatar,
          pokemonCount,
          coins,
          totalScore
        };
      });
      
      // Sort by total score
      const sortedStudents = studentsWithScore.sort((a, b) => b.totalScore - a.totalScore);
      
      // Add rank
      const rankedStudents = sortedStudents.map((student, index) => ({
        ...student,
        rank: index + 1
      }));
      
      console.log("Ranked students:", rankedStudents);
      
      // Show top 20 for school ranking
      setStudents(rankedStudents.slice(0, 20));
      
    } catch (error) {
      console.error("Error loading rankings:", error);
      setStudents([]);
    }
  };
  
  const handleStudentClick = (student: StudentWithScore) => {
    setSelectedStudent(student);
    
    // Load student's Pokemon
    try {
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      const pokemonData = studentPokemons.find((p: any) => p.studentId === student.id);
      
      if (pokemonData && pokemonData.pokemons) {
        setStudentPokemons(pokemonData.pokemons);
      } else {
        setStudentPokemons([]);
      }
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
        <h3 className="text-lg font-medium mb-6">{t("school-ranking")} - {t("top")} 20</h3>
        
        <div className="space-y-3">
          {students.map(student => (
            <div 
              key={student.id}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => handleStudentClick(student)}
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
                  <p className="font-medium text-sm">{student.displayName}</p>
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

export default SchoolRankingTab;
