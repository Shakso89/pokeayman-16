
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { getSchoolPokemonPool } from "@/utils/pokemon/schoolPokemon";
import { SchoolPoolPokemon } from "@/types/pokemon";
import { getStudentsByClass, StudentProfile } from "@/services/studentDatabase";
import { assignSpecificPokemonToStudent } from "@/utils/pokemon/studentPokemon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface SchoolPokemonPoolDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  classId: string;
  onPokemonGiven: () => void;
}

const SchoolPokemonPoolDialog: React.FC<SchoolPokemonPoolDialogProps> = ({
  isOpen,
  onOpenChange,
  schoolId,
  classId,
  onPokemonGiven,
}) => {
  const { t } = useTranslation();
  const [pokemonPool, setPokemonPool] = useState<SchoolPoolPokemon[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [givingPokemon, setGivingPokemon] = useState<SchoolPoolPokemon | null>(null);

  useEffect(() => {
    if (isOpen && schoolId && classId) {
      fetchData();
    }
  }, [isOpen, schoolId, classId]);

  const fetchData = async () => {
    setLoading(true);
    setGivingPokemon(null);
    try {
      const [pokemonData, studentsData] = await Promise.all([
        getSchoolPokemonPool(schoolId),
        getStudentsByClass(classId),
      ]);
      setPokemonPool(pokemonData || []);
      setStudents(studentsData || []);
    } catch (error) {
      console.error("Error fetching school pokemon pool or students:", error);
      setPokemonPool([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSpecific = async (pokemon: SchoolPoolPokemon, studentId: string) => {
    if (!studentId) return;
    setIsAssigning(true);
    setGivingPokemon(null);
    try {
      const student = students.find((s) => s.user_id === studentId);
      if (!student) {
        throw new Error("Student not found");
      }
      const result = await assignSpecificPokemonToStudent(
        pokemon.poolEntryId,
        pokemon.id,
        schoolId,
        studentId
      );

      if (result.success && result.pokemon) {
        toast({
          title: t("success"),
          description: `${result.pokemon.name} has been assigned to ${student.display_name}.`,
        });
        fetchData();
        onPokemonGiven();
      } else {
        toast({
          title: t("error"),
          description: "Failed to assign Pokemon. It might have been claimed already.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error assigning pokemon:", error);
      toast({
        title: t("error"),
        description: "An unexpected error occurred while assigning the Pokemon.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignRandom = async () => {
    if (pokemonPool.length === 0 || students.length === 0) {
      toast({
        title: t("error"),
        description: "Not enough Pokémon or students to perform a random assignment.",
        variant: "destructive",
      });
      return;
    }
    setIsAssigning(true);
    try {
      const randomPokemon = pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
      const randomStudent = students[Math.floor(Math.random() * students.length)];

      const result = await assignSpecificPokemonToStudent(
        randomPokemon.poolEntryId,
        randomPokemon.id,
        schoolId,
        randomStudent.user_id
      );

      if (result.success && result.pokemon) {
        toast({
          title: t("success"),
          description: `${result.pokemon.name} has been randomly assigned to ${randomStudent.display_name}.`,
        });
        fetchData();
        onPokemonGiven();
      } else {
        toast({
          title: t("error"),
          description: "Failed to assign random Pokemon. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error assigning random pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to assign random Pokemon.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-yellow-500";
      case "rare":
        return "bg-purple-500";
      case "uncommon":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("school-pokemon-pool")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {pokemonPool.length} Pokémon available in the school pool.
            </p>
            <Button
              onClick={handleAssignRandom}
              disabled={isAssigning || loading || pokemonPool.length === 0 || students.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAssigning ? "Assigning..." : "Assign Randomly"}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p>Loading...</p>
            </div>
          ) : pokemonPool.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No Pokémon available in the school pool.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pokemonPool.map((pokemon) => (
                <Card key={pokemon.poolEntryId} className="relative">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <h3 className="font-semibold text-center">{pokemon.name}</h3>
                      <div className="flex gap-2">
                        <Badge variant="outline">{pokemon.type}</Badge>
                        <Badge className={`text-white ${getRarityColor(pokemon.rarity)}`}>
                          {pokemon.rarity}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {givingPokemon?.poolEntryId === pokemon.poolEntryId ? (
                        <div className="space-y-2">
                          <Select
                            onValueChange={(studentId) => handleAssignSpecific(pokemon, studentId)}
                            disabled={isAssigning}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Give to..." />
                            </SelectTrigger>
                            <SelectContent>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.user_id}>
                                  {student.display_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setGivingPokemon(null)}
                            className="w-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setGivingPokemon(pokemon)}
                          disabled={isAssigning || students.length === 0}
                          className="w-full"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {students.length === 0 ? "No students in class" : "Give"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolPokemonPoolDialog;
