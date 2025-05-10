
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "lucide-react";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface PokemonWinModalProps {
  pokemon: Pokemon;
  onClose: () => void;
}

const PokemonWinModal: React.FC<PokemonWinModalProps> = ({
  pokemon,
  onClose
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 animate-fade-in">
      <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl max-w-md w-full animate-scale-in">
        <div className="relative p-6 text-center">
          <h2 className="text-2xl font-bold mb-3">{t("congratulations") || "Congratulations!"}</h2>
          <p className="text-lg mb-6">
            {/* Don't translate Pokemon name */}
            {(t("you-won-pokemon") || "You won {name}!").replace("{name}", pokemon.name)}
          </p>
          
          <div className="relative mb-6">
            <Sparkle className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-yellow-400 h-6 w-6 animate-pulse" />
            <Sparkle className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-yellow-400 h-8 w-8 animate-pulse" />
            
            <div className="mx-auto w-32 h-32 bg-white rounded-full p-2 border-4 border-white shadow-xl flex items-center justify-center">
              <img 
                src={pokemon.image} 
                alt={pokemon.name} 
                className="w-full h-full object-contain animate-bounce"
              />
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50 mb-4">
            <p className="mb-2">
              <span className="font-medium">
                {/* Display Pokemon type directly without translation */}
                Type: {pokemon.type}
              </span>
            </p>
            <p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${
                pokemon.rarity === 'legendary' ? 'bg-yellow-500' :
                pokemon.rarity === 'rare' ? 'bg-purple-500' :
                pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {pokemon.rarity}
              </span>
            </p>
          </div>
          
          <Button 
            className="w-full"
            onClick={onClose}
          >
            {t("close") || "Close"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PokemonWinModal;
