
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Pokemon } from "@/types/pokemon";

interface WheelControlsProps {
  isSpinning: boolean;
  coins: number;
  selectedPokemonIndex: number | null;
  visiblePokemon: Pokemon[];
  onSpin: () => void;
  canRefresh: boolean;
  onRefresh: () => void;
  showWinAnimation: boolean;
}

const WheelControls: React.FC<WheelControlsProps> = ({
  isSpinning,
  coins,
  selectedPokemonIndex,
  visiblePokemon,
  onSpin,
  canRefresh,
  onRefresh,
  showWinAnimation
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        className="pokemon-button text-lg px-8 py-6"
        disabled={isSpinning || coins <= 0}
        onClick={onSpin}
        size="lg"
      >
        {isSpinning ? t("spinning") : `${t("spin-wheel")} (1 ${t("coin")})`}
      </Button>
      
      {canRefresh && (
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={coins < 1 || isSpinning}
          className="mt-2"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("refresh-wheel")} (1 {t("coin")})
        </Button>
      )}
      
      <p className="mt-4 text-lg font-medium">{t("you-have")} {coins} {t("coins")}</p>
      
      {selectedPokemonIndex !== null && !isSpinning && !showWinAnimation && visiblePokemon[selectedPokemonIndex] && (
        <div className="mt-2 animate-fade-in">
          <p>{t("last-spin")}: <span className="font-bold">{visiblePokemon[selectedPokemonIndex].name}</span></p>
        </div>
      )}
    </div>
  );
};

export default WheelControls;
