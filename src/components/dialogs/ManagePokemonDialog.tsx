
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pokemon } from "@/types/pokemon";
import { getStudentPokemonCollection } from "@/utils/pokemon";
import { removePokemonFromStudentAndReturnToPool } from "@/utils/pokemon";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface ManagePokemonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  schoolId: string;
  onPokemonRemoved: () => void;
}

const ManagePokemonDialog = ({
  open,
  onOpenChange,
  studentId,
  studentName,
  schoolId,
  onPokemonRemoved
}: ManagePokemonDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadStudentPokemons();
    }
  }, [open, studentId]);

  const loadStudentPokemons = () => {
    setIsLoading(true);
    // Get student's Pokemon collection
    const collection = getStudentPokemonCollection(studentId);
    
    if (collection) {
      setPokemons(collection.pokemons || []);
    } else {
      setPokemons([]);
    }
    
    setIsLoading(false);
  };

  const handleRemovePokemon = (pokemonId: string, pokemonName: string) => {
    // Remove Pokemon and return it to school pool
    const success = removePokemonFromStudentAndReturnToPool(studentId, pokemonId, schoolId);
    
    if (success) {
      toast({
        title: t("pokemon-removed"),
        description: `${pokemonName} ${t("returned-to-pool")}`,
      });
      
      // Refresh the Pokemon list
      loadStudentPokemons();
      
      // Notify parent component
      onPokemonRemoved();
    } else {
      toast({
        title: t("error"),
        description: t("failed-to-remove-pokemon"),
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("manage-pokemon-for")} {studentName}</DialogTitle>
          <DialogDescription>
            {t("remove-pokemon-description")}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-6 text-center">{t("loading")}</div>
        ) : pokemons.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 my-4 max-h-[400px] overflow-y-auto p-1">
            {pokemons.map((pokemon) => (
              <div key={pokemon.id} className="border rounded-lg overflow-hidden bg-white">
                <div className="p-2 flex justify-center bg-gray-50">
                  <img 
                    src={pokemon.image} 
                    alt={pokemon.name} 
                    className="h-24 object-contain"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-center mb-1">{pokemon.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs rounded-full px-2 py-1 ${getRarityColor(pokemon.rarity)}`}>
                      {pokemon.rarity}
                    </span>
                    <span className="text-xs text-gray-500">{pokemon.type}</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => handleRemovePokemon(pokemon.id, pokemon.name)}
                  >
                    {t("remove")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            {t("no-pokemon-found")}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to get color based on rarity
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "bg-gray-100 text-gray-800";
    case "uncommon":
      return "bg-green-100 text-green-800";
    case "rare":
      return "bg-blue-100 text-blue-800";
    case "legendary":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default ManagePokemonDialog;
