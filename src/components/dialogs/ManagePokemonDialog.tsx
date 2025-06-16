
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";
import { assignRandomPokemonToStudent, assignSpecificPokemonToStudent, getStudentPokemonCollection, removePokemonFromStudent } from "@/utils/pokemon/studentPokemon";
import { getSchoolPokemonPool } from "@/utils/pokemon/schoolPokemon";
import { Pokemon, StudentCollectionPokemon } from "@/types/pokemon";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, Gift, Zap } from "lucide-react";

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
  teacherId,
  classId,
}) => {
  const { t } = useTranslation();
  const [studentPokemons, setStudentPokemons] = useState<StudentCollectionPokemon[]>([]);
  const [schoolPool, setSchoolPool] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    if (isOpen && studentId && schoolId) {
      loadData();
    }
  }, [isOpen, studentId, schoolId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log("Loading data for student:", studentId, "school:", schoolId);
      
      const [pokemons, pool] = await Promise.all([
        getStudentPokemonCollection(studentId),
        getSchoolPokemonPool(schoolId)
      ]);

      console.log("Student pokemons:", pokemons);
      console.log("School pool:", pool);
      
      setStudentPokemons(pokemons);
      setSchoolPool(pool);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: t("error"),
        description: "Failed to load Pokemon data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAwardRandomPokemon = async () => {
    if (!schoolId || !studentId) return;
    
    setIsLoading(true);
    try {
      console.log("Awarding random Pokemon to student:", studentId);
      
      const result = await assignRandomPokemonToStudent(schoolId, studentId);
      
      if (result.success && result.pokemon) {
        toast({
          title: t("success"),
          description: `${result.pokemon.name} awarded to ${studentName}!`
        });
        await loadData();
        onPokemonRemoved();
      } else {
        throw new Error(result.error || "Failed to award Pokemon");
      }
    } catch (error) {
      console.error("Error awarding random Pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to award Pokemon",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAwardSpecificPokemon = async (pokemon: Pokemon) => {
    if (!schoolId || !studentId) return;
    
    setIsLoading(true);
    try {
      console.log("Awarding specific Pokemon:", pokemon.name, "to student:", studentId);
      
      const result = await assignSpecificPokemonToStudent(pokemon.id, schoolId, studentId);
      
      if (result.success) {
        toast({
          title: t("success"),
          description: `${pokemon.name} awarded to ${studentName}!`
        });
        await loadData();
        onPokemonRemoved();
      } else {
        throw new Error(result.error || "Failed to award Pokemon");
      }
    } catch (error) {
      console.error("Error awarding specific Pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to award Pokemon",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePokemon = async (collectionId: string, pokemonName: string) => {
    setIsLoading(true);
    try {
      console.log("Removing Pokemon:", pokemonName, "collection ID:", collectionId);
      
      const success = await removePokemonFromStudent(collectionId);
      
      if (success) {
        toast({
          title: t("success"),
          description: `${pokemonName} removed from ${studentName}`
        });
        await loadData();
        onPokemonRemoved();
      } else {
        throw new Error("Failed to remove Pokemon");
      }
    } catch (error) {
      console.error("Error removing Pokemon:", error);
      toast({
        title: t("error"),
        description: "Failed to remove Pokemon",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClassCreator) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Pokémon - {studentName}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student's Pokemon Collection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Student's Collection ({studentPokemons.length})</h3>
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              {studentPokemons.length === 0 ? (
                <p className="text-gray-500 text-center">No Pokémon yet</p>
              ) : (
                <div className="space-y-3">
                  {studentPokemons.map((pokemon) => (
                    <div key={pokemon.collectionId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={pokemon.image} alt={pokemon.name} />
                          <AvatarFallback>{pokemon.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{pokemon.name}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline">{pokemon.type}</Badge>
                            <Badge variant="outline">{pokemon.rarity}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemovePokemon(pokemon.collectionId, pokemon.name)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* School Pokemon Pool */}
          <div>
            <h3 className="text-lg font-semibold mb-4">School Pool ({schoolPool.length})</h3>
            <div className="space-y-4">
              <Button
                onClick={handleAwardRandomPokemon}
                disabled={isLoading || schoolPool.length === 0}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Award Random Pokémon
              </Button>
              
              <Separator />
              
              <ScrollArea className="h-[340px] border rounded-lg p-4">
                {schoolPool.length === 0 ? (
                  <p className="text-gray-500 text-center">No Pokémon in school pool</p>
                ) : (
                  <div className="space-y-3">
                    {schoolPool.map((pokemon) => (
                      <div key={pokemon.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={pokemon.image} alt={pokemon.name} />
                            <AvatarFallback>{pokemon.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{pokemon.name}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline">{pokemon.type}</Badge>
                              <Badge variant="outline">{pokemon.rarity}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAwardSpecificPokemon(pokemon)}
                          disabled={isLoading}
                        >
                          <Gift className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePokemonDialog;
