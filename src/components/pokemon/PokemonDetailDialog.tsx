
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface PokemonDetailDialogProps {
  pokemon: Pokemon | null;
  isOpen: boolean;
  onClose: () => void;
}

const PokemonDetailDialog: React.FC<PokemonDetailDialogProps> = ({ 
  pokemon, 
  isOpen, 
  onClose 
}) => {
  const { t } = useTranslation();
  
  if (!pokemon) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{pokemon.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center p-4">
          <div className="w-48 h-48 bg-gray-100 rounded-lg p-4 mb-4">
            <img 
              src={pokemon.image} 
              alt={pokemon.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-2">
              <span className={`text-sm py-1 px-3 rounded-full font-medium ${
                pokemon.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' : 
                pokemon.rarity === 'rare' ? 'bg-purple-100 text-purple-800' : 
                pokemon.rarity === 'uncommon' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {pokemon.rarity}
              </span>
              <span className="text-sm py-1 px-3 rounded-full font-medium bg-gray-100 text-gray-800">
                {pokemon.type}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">{pokemon.description || t("no-description")}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PokemonDetailDialog;
