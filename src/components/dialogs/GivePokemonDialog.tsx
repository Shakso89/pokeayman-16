
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Pokemon } from "@/types/pokemon";

interface GivePokemonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePokemons: Pokemon[];
  onGivePokemon: (pokemon: Pokemon) => void;
}

const GivePokemonDialog: React.FC<GivePokemonDialogProps> = ({ 
  open, 
  onOpenChange, 
  availablePokemons,
  onGivePokemon
}) => {
  const { t } = useTranslation();
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  const handleGivePokemon = () => {
    if (selectedPokemon) {
      onGivePokemon(selectedPokemon);
    }
  };

  const handleClose = () => {
    setSelectedPokemon(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("give-pokemon-to-student")}</DialogTitle>
          <DialogDescription>
            {t("give-pokemon-description")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
            {availablePokemons.map((pokemon) => (
              <div 
                key={pokemon.id}
                className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                  selectedPokemon?.id === pokemon.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPokemon(pokemon)}
              >
                <img 
                  src={pokemon.image || "/placeholder.svg"} 
                  alt={pokemon.name} 
                  className="w-16 h-16 mx-auto object-contain" 
                />
                <p className="mt-2 text-sm font-medium">{pokemon.name}</p>
                <p className="text-xs text-gray-500">{pokemon.type}</p>
                <p className="text-xs text-gray-500 capitalize">{pokemon.rarity}</p>
              </div>
            ))}
            
            {availablePokemons.length === 0 && (
              <div className="col-span-full text-center py-6">
                <p className="text-gray-500">{t("no-available-pokemon")}</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleGivePokemon} disabled={!selectedPokemon}>
            {t("give-pokemon")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GivePokemonDialog;
