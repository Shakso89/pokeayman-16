
import React, { useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, X } from "lucide-react";
import { Pokemon } from "@/types/pokemon";
import confetti from "canvas-confetti";

interface MysteryBallResultProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    type: "pokemon" | "coins" | "nothing";
    data?: Pokemon | number;
  };
  pokemon: Pokemon | null;
  coins: number;
}

const MysteryBallResult: React.FC<MysteryBallResultProps> = ({ isOpen, onClose, result, pokemon, coins }) => {
  useEffect(() => {
    // Trigger confetti for pokemon or coins
    if (isOpen && (result.type === "pokemon" || result.type === "coins")) {
      confetti({
        particleCount: result.type === "pokemon" ? 100 : 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen, result.type]);

  const renderContent = () => {
    switch (result.type) {
      case "pokemon":
        // Use pokemon prop directly instead of result.data as it might be undefined
        if (!pokemon) {
          return (
            <div className="text-center">
              <p>No Pokémon data available</p>
            </div>
          );
        }
        
        return (
          <div className="text-center">
            <div className="relative mx-auto w-40 h-40 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full p-3 mb-4 border-4 border-purple-300 shadow-lg">
              <img 
                src={pokemon.image} 
                alt={pokemon.name} 
                className="w-full h-full object-contain animate-bounce-slow"
              />
              <div className="absolute -right-1 -top-1 bg-purple-600 text-white text-xs rounded-full w-8 h-8 flex items-center justify-center font-bold">
                NEW
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-1">{pokemon.name}</h3>
            <p className="text-gray-500 mb-2">{pokemon.type}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm text-white ${
              pokemon.rarity === 'legendary' ? 'bg-yellow-500' :
              pokemon.rarity === 'rare' ? 'bg-purple-500' :
              pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {pokemon.rarity}
            </span>
          </div>
        );
      
      case "coins":
        return (
          <div className="text-center">
            <div className="mx-auto w-32 h-32 bg-amber-100 rounded-full p-3 mb-4 border-4 border-amber-300 shadow-lg flex items-center justify-center">
              <Coins className="w-16 h-16 text-amber-500 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
              <span className="text-amber-600">+{coins}</span> coins
            </h3>
            <p className="text-gray-600">Coins added to your balance</p>
          </div>
        );
      
      case "nothing":
        return (
          <div className="text-center">
            <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full p-3 mb-4 border-4 border-gray-200 shadow-lg flex items-center justify-center">
              <X className="w-16 h-16 text-red-400" />
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-red-500">Nothing Found!</h3>
            <p className="text-gray-600">Try again later</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {result.type === "pokemon" ? "You Got a Pokémon!" : 
             result.type === "coins" ? "You Got Coins!" : 
             "Empty Ball"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          {renderContent()}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MysteryBallResult;
