
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { getStudentPokemonCollection, removePokemonFromStudentAndReturnToPool } from "@/utils/pokemon/studentPokemon";
import { Pokemon } from "@/types/pokemon";

interface ManagePokemonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  schoolId: string;
  onPokemonRemoved: () => void;
  isClassCreator: boolean;
}

const ManagePokemonDialog: React.FC<ManagePokemonDialogProps> = ({
  isOpen,
  onOpenChange,
  studentId,
  studentName,
  schoolId,
  onPokemonRemoved,
  isClassCreator
}) => {
  const { t } = useTranslation();
  const [studentPokemons, setStudentPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && studentId && studentId !== "all") {
      fetchStudentPokemons();
    }
  }, [isOpen, studentId]);

  const fetchStudentPokemons = () => {
    try {
      const collection = getStudentPokemonCollection(studentId);
      setStudentPokemons(collection?.pokemons || []);
    } catch (error) {
      console.error("Error fetching student pokemons:", error);
      setStudentPokemons([]);
    }
  };

  const handleRemovePokemon = async (pokemonId: string, pokemonName: string) => {
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
      const success = removePokemonFromStudentAndReturnToPool(studentId, pokemonId, schoolId);
      
      if (success) {
        toast({
          title: t("success"),
          description: `${pokemonName} has been removed and returned to school pool`
        });
        
        // Refresh the pokemon list
        fetchStudentPokemons();
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
          {studentPokemons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">This student has no Pokemon yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentPokemons.map((pokemon) => (
                <Card key={pokemon.id} className="relative">
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
                      {pokemon.level && (
                        <Badge variant="secondary">Level {pokemon.level}</Badge>
                      )}
                      
                      {isClassCreator && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemovePokemon(pokemon.id, pokemon.name)}
                          disabled={loading}
                          className="w-full mt-2"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove & Return to Pool
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
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
