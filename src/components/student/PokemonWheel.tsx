
import React from "react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Pokemon } from "@/types/pokemon";
import { useWheelLogic } from "./wheel/useWheelLogic";
import PokemonWheelAnimation from "./wheel/PokemonWheelAnimation";
import PokemonWinModal from "./wheel/PokemonWinModal";
import WheelControls from "./wheel/WheelControls";
import EmptyWheelState from "./wheel/EmptyWheelState";

interface PokemonWheelProps {
  studentId: string;
  classId: string;
  coins: number;
  onPokemonWon: (pokemon: Pokemon) => void;
}

const PokemonWheel: React.FC<PokemonWheelProps> = ({ 
  studentId, 
  classId,
  coins,
  onPokemonWon
}) => {
  const {
    isSpinning,
    rotationDegree,
    selectedPokemonIndex,
    visiblePokemon,
    showWinAnimation,
    wonPokemon,
    canRefresh,
    wheelSegmentDegree,
    handleSpin,
    handleRefreshWheel,
    closeWinModal
  } = useWheelLogic(studentId, classId, coins, onPokemonWon);

  // Show message when no Pokemon are available
  if (visiblePokemon.length === 0) {
    return <EmptyWheelState 
      canRefresh={canRefresh} 
      onRefreshWheel={handleRefreshWheel} 
      coins={coins} 
    />;
  }
  
  return (
    <div className="flex flex-col items-center">
      {/* The Pokemon Win Animation/Modal */}
      <PokemonWinModal 
        showWinAnimation={showWinAnimation}
        wonPokemon={wonPokemon}
        onClose={closeWinModal}
      />

      <PokemonWheelAnimation
        visiblePokemon={visiblePokemon}
        rotationDegree={rotationDegree}
        isSpinning={isSpinning}
        wheelSegmentDegree={wheelSegmentDegree}
      />
      
      <WheelControls
        isSpinning={isSpinning}
        coins={coins}
        selectedPokemonIndex={selectedPokemonIndex}
        visiblePokemon={visiblePokemon}
        onSpin={handleSpin}
        canRefresh={canRefresh}
        onRefresh={handleRefreshWheel}
        showWinAnimation={showWinAnimation}
      />
    </div>
  );
};

export default PokemonWheel;
