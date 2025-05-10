
import React from "react";
import { Pokemon } from "@/types/pokemon";
import { Sparkle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { getRarityStyles } from "./pokemonWheelUtils";

interface PokemonWinModalProps {
  showWinAnimation: boolean;
  wonPokemon: Pokemon | null;
  onClose: () => void;
}

const PokemonWinModal: React.FC<PokemonWinModalProps> = ({
  showWinAnimation,
  wonPokemon,
  onClose
}) => {
  const { t } = useTranslation();
  
  if (!showWinAnimation || !wonPokemon) {
    return null;
  }
  
  const rarityStyles = getRarityStyles(wonPokemon.rarity);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 animate-fade-in">
      <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl max-w-md w-full animate-scale-in">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${rarityStyles.gradient}`}></div>
        
        <div className="relative p-6 text-center">
          <h2 className="text-2xl font-bold mb-3">{t("congratulations")}</h2>
          <p className="text-lg mb-6">{t("you-won-pokemon").replace("{name}", wonPokemon.name)}</p>
          
          <div className="relative mb-6">
            {/* Sparkle animations around the Pokemon */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 animate-pulse">
              <Sparkle className="text-yellow-400 h-6 w-6" />
            </div>
            <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "0.5s" }}>
              <Sparkle className="text-yellow-400 h-8 w-8" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: "1s" }}>
              <Sparkle className="text-yellow-400 h-7 w-7" />
            </div>
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "0.7s" }}>
              <Star className="text-yellow-400 h-5 w-5" />
            </div>
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "1.2s" }}>
              <Star className="text-yellow-400 h-5 w-5" />
            </div>
            
            <div className="mx-auto w-32 h-32 bg-white rounded-full p-2 border-4 border-white shadow-xl flex items-center justify-center">
              <img 
                src={wonPokemon.image} 
                alt={wonPokemon.name} 
                className="w-full h-full object-contain animate-bounce"
                style={{ animationDuration: "2s" }}
              />
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50 mb-4">
            <p className="mb-2">
              <span className={`font-medium ${rarityStyles.text}`}>
                {t("pokemon-type").replace("{type}", wonPokemon.type)}
              </span>
            </p>
            <p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${rarityStyles.background}`}>
                {t("pokemon-rarity").replace("{rarity}", wonPokemon.rarity)}
              </span>
            </p>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">{t("pokemon-added")}</p>
          
          <Button 
            className="pokemon-button w-full"
            onClick={onClose}
          >
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PokemonWinModal;
