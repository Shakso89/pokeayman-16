
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Coins, Award, Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { getStudentPokemonCollection } from "@/utils/pokemon/studentPokemon";
import { assignRandomPokemonToStudent, removePokemonFromStudent } from "@/utils/pokemon/studentPokemon";
import { initializeSchoolPokemonPool } from "@/utils/pokemon/schoolPokemon";
import { toast } from "@/hooks/use-toast";
import PokemonActionModal from "@/components/pokemon/PokemonActionModal";
import { Pokemon } from "@/types/pokemon";

interface Student {
  id: string;
  username: string;
  displayName?: string;
  display_name?: string;
  avatar?: string;
  schoolId?: string;
}

interface StudentsGridProps {
  students: Student[];
  isClassCreator: boolean;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onRemoveCoins: (studentId: string, studentName: string) => void;
  onRemovePokemon: (studentId: string, studentName: string) => void;
  classData: any;
}

const StudentsGrid: React.FC<StudentsGridProps> = ({
  students,
  isClassCreator,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onRemoveCoins,
  onRemovePokemon,
  classData
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Add state for Pokemon action modal
  const [pokemonActionModal, setPokemonActionModal] = useState({
    isOpen: false,
    pokemon: null as Pokemon | null,
    actionType: "awarded" as "awarded" | "removed",
    studentName: ""
  });

  const handleViewProfile = (studentId: string) => {
    navigate(`/student-profile/${studentId}`);
  };

  const getStudentCoins = (studentId: string): number => {
    try {
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      const studentData = studentPokemons.find((sp: any) => sp.studentId === studentId);
      return studentData?.coins || 0;
    } catch {
      return 0;
    }
  };

  const getStudentPokemonCount = (studentId: string): number => {
    try {
      const collection = getStudentPokemonCollection(studentId);
      return collection?.pokemons?.length || 0;
    } catch {
      return 0;
    }
  };

  const handleAwardRandomPokemon = async (studentId: string, studentName: string) => {
    const schoolId = classData?.schoolId;
    if (!schoolId) {
      toast({
        title: t("error"),
        description: "School ID not found",
        variant: "destructive"
      });
      return;
    }

    console.log("Awarding Pokemon to student:", { studentId, studentName, schoolId });

    try {
      // Ensure school pool exists before assigning
      initializeSchoolPokemonPool(schoolId, 500);
      
      const result = assignRandomPokemonToStudent(schoolId, studentId);
      if (result.success && result.pokemon) {
        setPokemonActionModal({
          isOpen: true,
          pokemon: result.pokemon,
          actionType: "awarded",
          studentName
        });
        toast({
          title: t("success"),
          description: `Random Pokémon awarded to ${studentName}`
        });
      } else {
        toast({
          title: t("error"),
          description: "Failed to award Pokémon - no Pokémon available in school pool",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error awarding random Pokémon:", error);
      toast({
        title: t("error"),
        description: "Failed to award Pokémon",
        variant: "destructive"
      });
    }
  };

  const handleRemoveRandomPokemon = async (studentId: string, studentName: string) => {
    console.log("Removing Pokemon from student:", { studentId, studentName });
    
    try {
      const result = removePokemonFromStudent(studentId);
      if (result.success && result.pokemon) {
        setPokemonActionModal({
          isOpen: true,
          pokemon: result.pokemon,
          actionType: "removed",
          studentName
        });
        toast({
          title: t("success"),
          description: `Random Pokémon removed from ${studentName} and returned to school pool`
        });
      } else {
        toast({
          title: t("error"),
          description: "Student has no Pokémon to remove",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing random Pokémon:", error);
      toast({
        title: t("error"),
        description: "Failed to remove Pokémon",
        variant: "destructive"
      });
    }
  };

  const handleCloseModal = () => {
    setPokemonActionModal({
      isOpen: false,
      pokemon: null,
      actionType: "awarded",
      studentName: ""
    });
  };

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("no-students-in-class")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(student => {
          const displayName = student.displayName || student.display_name || student.username;
          const coins = getStudentCoins(student.id);
          const pokemonCount = getStudentPokemonCount(student.id);
          const profileRoute = `/student-profile/${student.id}`;

          return (
            <Card key={student.id} className="bg-white/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Avatar */}
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={student.avatar} alt={displayName} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Student Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{displayName}</h3>
                    <p className="text-sm text-gray-600">@{student.username}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex space-x-4 w-full">
                    <div className="flex-1 bg-yellow-100 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center space-x-1 text-yellow-700">
                        <Coins className="h-4 w-4" />
                        <span className="text-sm font-medium">Coins</span>
                      </div>
                      <p className="text-xl font-bold text-yellow-800">{coins}</p>
                    </div>
                    
                    <div className="flex-1 bg-purple-100 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center space-x-1 text-purple-700">
                        <Award className="h-4 w-4" />
                        <span className="text-sm font-medium">Pokémon</span>
                      </div>
                      <p className="text-xl font-bold text-purple-800">{pokemonCount}</p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  {isClassCreator && (
                    <div className="flex space-x-2 w-full">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white" 
                        onClick={() => handleAwardRandomPokemon(student.id, displayName)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Give Pokémon
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => handleRemoveRandomPokemon(student.id, displayName)}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Remove Pokémon
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 w-full">
                    {isClassCreator && (
                      <>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => onAwardCoins(student.id, displayName)} className="flex-1">
                            <Coins className="h-4 w-4 mr-1" />
                            {t("give-coins")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onRemoveCoins(student.id, displayName)} className="flex-1">
                            <Minus className="h-4 w-4 mr-1" />
                            {t("remove-coins")}
                          </Button>
                        </div>

                        <Button size="sm" variant="outline" onClick={() => onManagePokemon(student.id, displayName, student.schoolId || classData.schoolId || "")} className="w-full">
                          <Award className="h-4 w-4 mr-2" />
                          {t("manage-pokemon")}
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full flex items-center justify-center"
                          onClick={() => navigate(profileRoute)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          {t("view-profile") || "View Profile"}
                        </Button>

                        <Button size="sm" variant="destructive" onClick={() => onRemoveStudent(student.id, displayName)} className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("remove-student")}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pokemon Action Modal */}
      <PokemonActionModal 
        pokemon={pokemonActionModal.pokemon} 
        isOpen={pokemonActionModal.isOpen} 
        onClose={handleCloseModal} 
        actionType={pokemonActionModal.actionType} 
        studentName={pokemonActionModal.studentName} 
      />
    </>
  );
};

export default StudentsGrid;
