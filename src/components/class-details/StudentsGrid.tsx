import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Coins, Award, Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { assignPokemonToStudent, removePokemonFromStudent } from "@/utils/pokemon/studentPokemon";
import { initializeSchoolPokemonPool } from "@/utils/pokemon/schoolPokemon";
import { toast } from "@/hooks/use-toast";
import PokemonActionModal from "@/components/pokemon/PokemonActionModal";
import { Pokemon } from "@/types/pokemon";
import { useStudentCoinData } from "@/hooks/useStudentCoinData";
import { awardCoinsToStudent, removeCoinsFromStudent } from "@/services/studentCoinService";
import { supabase } from "@/integrations/supabase/client";

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

const StudentCard: React.FC<{
  student: Student;
  isClassCreator: boolean;
  onAwardCoins: (studentId: string, studentName: string) => void;
  onManagePokemon: (studentId: string, studentName: string, schoolId: string) => void;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onRemoveCoins: (studentId: string, studentName: string) => void;
  onRemovePokemon: (studentId: string, studentName: string) => void;
  classData: any;
  onPokemonAction: (pokemon: Pokemon, actionType: "awarded" | "removed", studentName: string) => void;
}> = ({
  student,
  isClassCreator,
  onAwardCoins,
  onManagePokemon,
  onRemoveStudent,
  onRemoveCoins,
  onRemovePokemon,
  classData,
  onPokemonAction
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { coins, pokemonCount, refreshData } = useStudentCoinData(student.id);

  const displayName = student.displayName || student.display_name || student.username;

  const handleViewProfile = () => {
    navigate(`/student-profile/${student.id}`);
  };

  const handleAwardCoins = async () => {
    const success = await awardCoinsToStudent(student.id, 10);
    if (success) {
      toast({
        title: t("success"),
        description: `10 coins awarded to ${displayName}`
      });
      refreshData();
    } else {
      toast({
        title: t("error"),
        description: "Failed to award coins",
        variant: "destructive"
      });
    }
  };

  const handleRemoveCoins = async () => {
    const success = await removeCoinsFromStudent(student.id, 5);
    if (success) {
      toast({
        title: t("success"),
        description: `5 coins removed from ${displayName}`
      });
      refreshData();
    } else {
      toast({
        title: t("error"),
        description: "Failed to remove coins or insufficient coins",
        variant: "destructive"
      });
    }
  };

  const handleAwardRandomPokemon = async () => {
    const schoolId = classData?.schoolId;
    if (!schoolId) {
      toast({
        title: t("error"),
        description: "School ID not found",
        variant: "destructive"
      });
      return;
    }

    try {
      // First ensure the school pool has Pokemon
      await initializeSchoolPokemonPool(schoolId, 500);
      
      // Get a random available Pokemon from the school pool
      const { data: availablePoolRows, error } = await supabase
        .from('pokemon_pools')
        .select('*')
        .eq('school_id', schoolId)
        .eq('available', true)
        .limit(50); // Get a reasonable number to pick from

      if (error) {
        console.error("Error fetching available Pokemon:", error);
        toast({
          title: t("error"),
          description: "Failed to fetch available Pokemon",
          variant: "destructive"
        });
        return;
      }

      if (!availablePoolRows || availablePoolRows.length === 0) {
        toast({
          title: t("error"),
          description: "No Pokemon available in school pool",
          variant: "destructive"
        });
        return;
      }

      // Pick a random Pokemon from available ones
      const randomIndex = Math.floor(Math.random() * availablePoolRows.length);
      const selectedPokemon = availablePoolRows[randomIndex];

      // Assign the Pokemon using the pool row ID
      const result = await assignPokemonToStudent(schoolId, student.id, undefined, selectedPokemon.id);
      
      if (result.success && !result.isDuplicate) {
        const pokemon: Pokemon = {
          id: selectedPokemon.pokemon_id,
          name: selectedPokemon.pokemon_name,
          image: selectedPokemon.pokemon_image || '',
          type: selectedPokemon.pokemon_type || '',
          rarity: (selectedPokemon.pokemon_rarity as any) || 'common',
          level: selectedPokemon.pokemon_level || 1,
        };
        
        onPokemonAction(pokemon, "awarded", displayName);
        refreshData();
        toast({
          title: t("success"),
          description: `${pokemon.name} awarded to ${displayName}`
        });
      } else if (result.isDuplicate) {
        toast({
          title: t("info"),
          description: `Duplicate Pokemon found, coins awarded instead`,
        });
        refreshData();
      } else {
        toast({
          title: t("error"),
          description: "Failed to assign Pokemon. It might not be available in the pool.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error awarding random Pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to award Pokemon",
        variant: "destructive"
      });
    }
  };

  const handleRemoveRandomPokemon = async () => {
    try {
      const result = await removePokemonFromStudent(student.id);
      if (result.success && result.pokemon) {
        onPokemonAction(result.pokemon, "removed", displayName);
        refreshData();
        toast({
          title: t("success"),
          description: `Random Pokemon removed from ${displayName} and returned to school pool`
        });
      } else {
        toast({
          title: t("error"),
          description: "Student has no Pokemon to remove",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing random Pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to remove Pokemon",
        variant: "destructive"
      });
    }
  };

  return (
    <Card 
      className="bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
      onClick={handleViewProfile}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={student.avatar} alt={displayName} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h3 className="font-semibold text-lg">{displayName}</h3>
            <p className="text-sm text-gray-600">@{student.username}</p>
          </div>

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
                <span className="text-sm font-medium">Pokemon</span>
              </div>
              <p className="text-xl font-bold text-purple-800">{pokemonCount}</p>
            </div>
          </div>

          {isClassCreator && (
            <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-white/20 mt-4">
              <Button 
                size="sm" 
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={(e) => { e.stopPropagation(); handleAwardCoins(); }}
              >
                <Coins className="h-4 w-4 mr-1" />
                Coins
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={(e) => { e.stopPropagation(); handleRemoveCoins(); }}
              >
                <Minus className="h-4 w-4 mr-1" />
                Coins 
              </Button>

              <Button
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={(e) => { e.stopPropagation(); handleAwardRandomPokemon(); }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Pokemon
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); handleRemoveRandomPokemon(); }}
              >
                <Minus className="h-4 w-4 mr-1" />
                Pokemon
              </Button>

              <Button 
                size="sm" 
                variant="outline" 
                onClick={(e) => { e.stopPropagation(); onManagePokemon(student.id, displayName, student.schoolId || classData.schoolId || ""); }}
                className="col-span-2"
              >
                <Award className="h-4 w-4 mr-2" />
                {t("manage-pokemon")}
              </Button>

              <Button 
                size="sm" 
                variant="destructive" 
                onClick={(e) => { e.stopPropagation(); onRemoveStudent(student.id, displayName); }}
                className="col-span-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("remove-student")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

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
  const { t } = useTranslation();
  const [pokemonActionModal, setPokemonActionModal] = useState({
    isOpen: false,
    pokemon: null as Pokemon | null,
    actionType: "awarded" as "awarded" | "removed",
    studentName: ""
  });

  const handlePokemonAction = (pokemon: Pokemon, actionType: "awarded" | "removed", studentName: string) => {
    setPokemonActionModal({
      isOpen: true,
      pokemon,
      actionType,
      studentName
    });
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
        {students.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            isClassCreator={isClassCreator}
            onAwardCoins={onAwardCoins}
            onManagePokemon={onManagePokemon}
            onRemoveStudent={onRemoveStudent}
            onRemoveCoins={onRemoveCoins}
            onRemovePokemon={onRemovePokemon}
            classData={classData}
            onPokemonAction={handlePokemonAction}
          />
        ))}
      </div>

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
