
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Gift, Shuffle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  getStudentPokemonCollection, 
  removePokemonFromStudentAndReturnToPool,
  assignRandomPokemonToStudent 
} from "@/utils/pokemon/studentPokemon";
import { Pokemon } from "@/types/pokemon";
import { toast } from "@/hooks/use-toast";
import { checkAndConsumeCredits } from "@/utils/creditsService";

interface ManagePokemonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  schoolId: string;
  onUpdate: () => void;
}

const ManagePokemonDialog: React.FC<ManagePokemonDialogProps> = ({
  open,
  onOpenChange,
  studentId,
  studentName,
  schoolId,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && studentId) {
      loadStudentPokemons();
    }
  }, [open, studentId]);

  const loadStudentPokemons = () => {
    try {
      const collection = getStudentPokemonCollection(studentId);
      setStudentPokemons(collection?.pokemons || []);
    } catch (error) {
      console.error("Error loading student Pokemon:", error);
      setStudentPokemons([]);
    }
  };

  const handleRemovePokemon = async (pokemon: Pokemon) => {
    const teacherId = localStorage.getItem("teacherId");
    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher ID not found",
        variant: "destructive"
      });
      return;
    }

    // Check and consume 3 credits for removing Pokemon
    const canProceed = await checkAndConsumeCredits(
      teacherId, 
      3, 
      `Removing Pokemon ${pokemon.name} from ${studentName}`
    );
    
    if (!canProceed) {
      return; // Credits check failed
    }

    setLoading(true);
    try {
      const success = removePokemonFromStudentAndReturnToPool(studentId, pokemon.id, schoolId);
      
      if (success) {
        toast({
          title: "Success",
          description: `${pokemon.name} removed from ${studentName} and returned to school pool. 3 credits consumed.`
        });
        loadStudentPokemons();
        onUpdate();
      } else {
        toast({
          title: "Error",
          description: "Failed to remove Pokemon",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing Pokemon:", error);
      toast({
        title: "Error",
        description: "Failed to remove Pokemon",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGiveRandomPokemon = async () => {
    const teacherId = localStorage.getItem("teacherId");
    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher ID not found",
        variant: "destructive"
      });
      return;
    }

    // Check and consume 5 credits for awarding random Pokemon
    const canProceed = await checkAndConsumeCredits(
      teacherId, 
      5, 
      `Awarding random Pokemon to ${studentName}`
    );
    
    if (!canProceed) {
      return; // Credits check failed
    }

    setLoading(true);
    try {
      const result = assignRandomPokemonToStudent(schoolId, studentId);
      
      if (result.success && result.pokemon) {
        toast({
          title: "Success",
          description: `${result.pokemon.name} awarded to ${studentName}! 5 credits consumed.`
        });
        loadStudentPokemons();
        onUpdate();
      } else {
        toast({
          title: "Error",
          description: "No Pokemon available in school pool or failed to assign",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error giving random Pokemon:", error);
      toast({
        title: "Error",
        description: "Failed to award Pokemon",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage {studentName}'s Pokémon Collection ({studentPokemons.length} Pokémon)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-2">
            <Button
              onClick={handleGiveRandomPokemon}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Gift className="h-4 w-4 mr-2" />
              Give Random Pokémon (5 credits)
            </Button>
          </div>

          {studentPokemons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{studentName} has no Pokémon yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentPokemons.map((pokemon) => (
                <Card
                  key={pokemon.id}
                  className="bg-white/20 backdrop-blur-sm rounded-xl shadow-md"
                >
                  <CardContent className="p-4 flex flex-col items-center space-y-3">
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
                    {pokemon.level && (
                      <Badge variant="secondary">Level {pokemon.level}</Badge>
                    )}
                    <Button
                      onClick={() => handleRemovePokemon(pokemon)}
                      disabled={loading}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove (3 credits)
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>{t("close")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePokemonDialog;
