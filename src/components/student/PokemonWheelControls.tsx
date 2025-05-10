
import React from "react";
import { Button } from "@/components/ui/button";
import { CirclePlay } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Pokemon } from "@/types/pokemon";

interface PokemonWheelControlsProps {
  isSpinning: boolean;
  coins: number;
  onSpin: () => void;
  selectedPokemonIndex: number | null;
  wheelPokemons: Pokemon[];
  showWinAnimation: boolean;
}

const PokemonWheelControls: React.FC<PokemonWheelControlsProps> = ({
  isSpinning,
  coins,
  onSpin,
  selectedPokemonIndex,
  wheelPokemons,
  showWinAnimation
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <Button
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2 shadow-lg"
        disabled={isSpinning || coins <= 0}
        onClick={onSpin}
        size="lg"
      >
        <CirclePlay className="h-5 w-5" />
        {isSpinning ? 
          (t("spinning") || "Spinning...") : 
          (t("spin-wheel") || "Spin Wheel") + ` (1 ${t("coin") || "Coin"})`
        }
      </Button>
      
      <p className="text-center text-sm text-gray-500">
        {t("you-have") || "You have"} <span className="font-bold">{coins}</span> {coins === 1 ? (t("coin") || "coin") : (t("coins") || "coins")}
      </p>
      
      {selectedPokemonIndex !== null && !isSpinning && !showWinAnimation && wheelPokemons[selectedPokemonIndex] && (
        <div className="mt-2 animate-fade-in">
          <p>{t("last-spin") || "Last spin"}: <span className="font-bold">{wheelPokemons[selectedPokemonIndex].name}</span></p>
        </div>
      )}
    </div>
  );
};

export default PokemonWheelControls;
