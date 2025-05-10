
import React, { useState } from "react";
import { Pokemon } from "@/types/pokemon";
import { 
  assignPokemonToStudent, 
  useStudentCoin 
} from "@/utils/pokemon";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import PokemonWinModal from "./PokemonWinModal";
import PokemonWheelAnimation from "./PokemonWheelAnimation";
import PokemonWheelControls from "./PokemonWheelControls";

interface PokemonWheelProps {
  studentId: string;
  classId: string;
  coins: number;
  onPokemonWon: (pokemon: Pokemon) => void;
  wheelPokemons: Pokemon[];
}

const PokemonWheel: React.FC<PokemonWheelProps> = ({
  studentId,
  classId,
  coins,
  onPokemonWon,
  wheelPokemons
}) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [wonPokemon, setWonPokemon] = useState<Pokemon | null>(null);

  // Handle spinning the wheel
  const handleSpin = () => {
    if (isSpinning || wheelPokemons.length === 0) return;
    if (coins < 1) {
      toast({
        title: t("not-enough-coins") || "Not Enough Coins",
        description: t("need-coins-to-spin") || "You need coins to spin the wheel",
      });
      return;
    }
    
    // Use a coin to spin
    const success = useStudentCoin(studentId);
    if (!success) {
      toast({
        title: t("error") || "Error",
        description: t("failed-to-use-coin") || "Failed to use coin",
      });
      return;
    }
    
    setIsSpinning(true);
    setShowWinAnimation(false);
    setWonPokemon(null);
    
    // Randomly select a Pokémon
    const winnerIndex = Math.floor(Math.random() * wheelPokemons.length);
    
    // Calculate rotation to land on the winner
    const segmentDegree = 360 / wheelPokemons.length;
    const baseRotation = 1800; // Multiple spins for effect
    const winnerRotation = winnerIndex * segmentDegree;
    const targetRotation = baseRotation + winnerRotation;
    
    setRotationDegree(targetRotation);
    setSelectedPokemonIndex(winnerIndex);
    
    // Wait for spin animation to complete
    setTimeout(() => {
      setIsSpinning(false);
      
      // Assign the Pokémon to the student
      const pokemon = wheelPokemons[winnerIndex];
      const assignSuccess = assignPokemonToStudent(classId, studentId, pokemon.id);
      
      if (assignSuccess) {
        // Show win animation
        setWonPokemon(pokemon);
        setShowWinAnimation(true);
        
        // Notify parent component with just the pokemon object
        onPokemonWon(pokemon);
        
        toast({
          title: t("congratulations") || "Congratulations!",
          description: (t("you-won-pokemon") || "You won {name}!").replace("{name}", pokemon.name),
        });
      } else {
        toast({
          title: t("error") || "Error",
          description: t("failed-to-claim-pokemon") || "Failed to claim Pokémon",
        });
      }
    }, 3000);
  };
  
  // Close the win modal
  const closeWinModal = () => {
    setShowWinAnimation(false);
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* Pokemon Win Modal */}
      {showWinAnimation && wonPokemon && (
        <PokemonWinModal 
          pokemon={wonPokemon}
          onClose={closeWinModal}
        />
      )}
      
      {/* Wheel Animation */}
      <PokemonWheelAnimation
        pokemons={wheelPokemons}
        rotationDegree={rotationDegree}
        isSpinning={isSpinning}
      />
      
      {/* Spin Button and Controls */}
      <PokemonWheelControls
        isSpinning={isSpinning}
        coins={coins}
        onSpin={handleSpin}
        selectedPokemonIndex={selectedPokemonIndex}
        wheelPokemons={wheelPokemons}
        showWinAnimation={showWinAnimation}
      />
    </div>
  );
};

export default PokemonWheel;
