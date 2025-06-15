import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowLeft, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { getStudentPokemonCollection, removePokemonFromStudent } from "@/utils/pokemon/studentPokemon";
import { assignRandomPokemonToStudent, assignSpecificPokemonToStudent } from "@/utils/pokemon/studentPokemon";
import { getSchoolPokemonPool } from "@/utils/pokemon/schoolPokemon";
import { StudentCollectionPokemon, SchoolPoolPokemon } from "@/types/pokemon";
import { Separator } from "@/components/ui/separator";

interface ManagePokemonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  schoolId: string;
  onPokemonRemoved: () => void;
  isClassCreator: boolean;
  teacherId: string;
  classId: string;
}

const ManagePokemonDialog: React.FC<ManagePokemonDialogProps> = ({
  isOpen,
  onOpenChange,
  studentId,
  studentName,
  schoolId,
  onPokemonRemoved,
  isClassCreator,
}) => {
  const { t } = useTranslation();
  const [studentPokemons, setStudentPokemons] = useState<StudentCollectionPokemon[]>([]);
  const [schoolPool, setSchoolPool] = useState<SchoolPoolPokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningPokemon, setAssigningPokemon] = useState(false);

  useEffect(() => {
    if (isOpen && studentId && studentId !== "all") {
      fetchData();
    }
  }, [isOpen, studentId, schoolId]);

  const fetchData = async () => {
    if (!studentId || !schoolId) return;
    setLoading(true);
    try {
      const [studentCollection, schoolPoolData] = await Promise.all([
        getStudentPokemonCollection(studentId),
        getSchoolPokemonPool(schoolId)
      ]);
      
      setStudentPokemons(studentCollection);
      setSchoolPool(schoolPoolData || []);

    } catch (error) {
      console.error("Error fetching Pokemon data:", error);
      setStudentPokemons([]);
      setSchoolPool([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePokemon = async (collectionId: string, pokemonName: string) => {
    if (!isClassCreator) {
      toast({
        title: t("error"),
        description: "Only class creators can remove Pokemon",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const success = await removePokemonFromStudent(collectionId);
      
      if (success) {
        toast({
          title: t("success"),
          description: `${pokemonName} has been removed.`
        });
        
        fetchData();
        onPokemonRemoved();
      } else {
        toast({
          title: t("error"),
          description: "Failed to remove Pokemon",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to remove Pokemon",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRandomPokemon = async () => {
    if (!isClassCreator) {
      toast({
        title: t("error"),
        description: "Only class creators can assign Pokemon",
        variant: "destructive"
      });
      return;
    }
    setAssigningPokemon(true);
    try {
      const result = await assignRandomPokemonToStudent(schoolId, studentId);
      if (result.success && result.pokemon) {
        toast({
          title: t("success"),
          description: `${result.pokemon.name} has been assigned to ${studentName}`
        });
        fetchData();
        onPokemonRemoved();
      } else {
        toast({
          title: t("error"),
          description: "Failed to assign Pokemon.",
          variant: "destructive"
        });
      }
    } finally {
      setAssigningPokemon(false);
    }
  };

  const handleAssignSpecificPokemon = async (pokemon: SchoolPoolPokemon) => {
    if (!isClassCreator) {
      toast({
        title: t("error"),
        description: "Only class creators can assign Pokemon",
        variant: "destructive",
      });
      return;
    }

    setAssigningPokemon(true);
    try {
      const result = await assignSpecificPokemonToStudent(pokemon.id, schoolId, studentId);

      if (result.success && result.pokemon) {
        toast({
          title: t("success"),
          description: `${result.pokemon.name} has been assigned to ${studentName}`,
        });
        fetchData();
        onPokemonRemoved();
      } else {
        toast({
          title: t("error"),
          description: `Failed to assign Pokemon. ${result.error ? `Reason: ${result.error}` : 'Please try again.'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error assigning pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to assign Pokemon",
        variant: "destructive",
      });
    } finally {
      setAssigningPokemon(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "bg-yellow-500";
      case "rare": return "bg-purple-500";
      case "uncommon": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  if (studentId === "all") {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Class Pokemon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              To manage Pokemon for individual students, please use the "Manage Pokemon" button on each student card in the students grid.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Class
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Pokemon - {studentName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <h4 className="font-semibold">Student's Collection ({studentPokemons.length})</h4>
          {loading ? (
            <div className="text-center py-8">
                <p>Loading student's pokemon...</p>
            </div>
          ) : studentPokemons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">This student has no Pokemon yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentPokemons.map((pokemon) => (
                <Card key={pokemon.collectionId} className="relative">
                  <CardContent className="p-4">
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
                      
                      {isClassCreator && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemovePokemon(pokemon.collectionId, pokemon.name)}
                          disabled={loading}
                          className="w-full mt-2"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="font-semibold">Assign from School Pool</h4>
                <p className="text-sm text-gray-500">
                  {schoolPool.length} Pokémon instances remaining in the school pool.
                </p>
              </div>
              {isClassCreator && (
                <Button
                  size="sm"
                  onClick={handleAssignRandomPokemon}
                  disabled={assigningPokemon}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {assigningPokemon ? 'Assigning...' : 'Assign Random Pokemon'}
                </Button>
              )}
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <p>Loading school pool...</p>
                </div>
            ) : schoolPool.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">The school pool is empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schoolPool.map((pokemon) => (
                  <Card key={pokemon.poolEntryId} className="relative">
                    <CardContent className="p-4">
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
                        
                        {isClassCreator && (
                          <Button
                            size="sm"
                            onClick={() => handleAssignSpecificPokemon(pokemon)}
                            disabled={assigningPokemon}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {assigningPokemon ? 'Assigning...' : 'Assign to Student'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePokemonDialog;
