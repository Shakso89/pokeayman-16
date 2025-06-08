
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
import { Gift, ArrowLeftRight } from "lucide-react";

interface PokemonActionModalProps {
  pokemon: Pokemon | null;
  isOpen: boolean;
  onClose: () => void;
  actionType: "awarded" | "removed";
  studentName: string;
}

const PokemonActionModal: React.FC<PokemonActionModalProps> = ({ 
  pokemon, 
  isOpen, 
  onClose,
  actionType,
  studentName
}) => {
  const { t } = useTranslation();
  
  if (!pokemon) return null;
  
  const isAwarded = actionType === "awarded";
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAwarded ? (
              <>
                <Gift className="h-5 w-5 text-green-600" />
                Pokémon Awarded!
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-5 w-5 text-orange-600" />
                Pokémon Removed
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center p-4">
          <div className={`w-48 h-48 rounded-lg p-4 mb-4 ${
            isAwarded ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'
          }`}>
            <img 
              src={pokemon.image} 
              alt={pokemon.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{pokemon.name}</h3>
            <p className={`text-sm mb-3 ${isAwarded ? 'text-green-700' : 'text-orange-700'}`}>
              {isAwarded 
                ? `Awarded to ${studentName}` 
                : `Removed from ${studentName} and returned to school pool`
              }
            </p>
            
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
            
            {pokemon.level && (
              <p className="text-sm text-gray-600">Level: {pokemon.level}</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PokemonActionModal;
