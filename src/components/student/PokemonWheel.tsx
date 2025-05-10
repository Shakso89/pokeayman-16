
import React, { useState } from "react";
import { Pokemon } from "@/types/pokemon";
import { assignPokemonToStudent, useStudentCoin } from "@/utils/pokemon";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PokemonWinModal from "./PokemonWinModal";

interface PokemonWheelProps {
  studentId: string;
  schoolId: string;
  coins: number;
  wheelPokemons: Pokemon[];
  onPokemonWon: (pokemon: Pokemon) => void;
}

const PokemonWheel: React.FC<PokemonWheelProps> = ({
  studentId,
  schoolId,
  coins,
  wheelPokemons,
  onPokemonWon
}) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [wonPokemon, setWonPokemon] = useState<Pokemon | null>(null);

  // Handle spinning the wheel
  const handleSpin = () => {
    if (isSpinning || wheelPokemons.length === 0) return;
    if (coins < 1) {
      toast({
        title: t("not-enough-coins") || "Not Enough Coins",
        description: t("need-coins-to-spin") || "You need at least 1 coin to spin the wheel",
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
    setShowWinModal(false);
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
      const assignSuccess = assignPokemonToStudent(schoolId, studentId, pokemon.id);
      
      if (assignSuccess) {
        setWonPokemon(pokemon);
        setShowWinModal(true);
        
        // Notify parent component with just the pokemon
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

  // Calculate wheel segment degree
  const segmentDegree = wheelPokemons.length > 0 ? 360 / wheelPokemons.length : 30;
  
  return (
    <div className="flex flex-col items-center">
      {/* Pokemon Win Modal */}
      {showWinModal && wonPokemon && (
        <PokemonWinModal
          pokemon={wonPokemon}
          onClose={() => setShowWinModal(false)}
        />
      )}
      
      {/* Wheel */}
      <div className="relative w-72 h-72 mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-6 h-6 bg-red-500 rotate-45 transform origin-bottom shadow-lg"></div>
        </div>
        
        {/* Wheel background */}
        <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner"></div>
        
        {/* Wheel */}
        <div 
          className="w-full h-full rounded-full relative overflow-hidden shadow-xl border-8 border-gray-700"
          style={{ 
            transform: `rotate(${rotationDegree}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)' : 'none'
          }}
        >
          {wheelPokemons.map((pokemon, index) => {
            const startAngle = index * segmentDegree;
            const endAngle = (index + 1) * segmentDegree;
            
            // Determine colors based on rarity
            const bgColor = pokemon.rarity === 'legendary' ? 'bg-yellow-500' :
                          pokemon.rarity === 'rare' ? 'bg-purple-500' :
                          pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500';
            
            const borderColor = pokemon.rarity === 'legendary' ? 'border-yellow-600' :
                              pokemon.rarity === 'rare' ? 'border-purple-600' :
                              pokemon.rarity === 'uncommon' ? 'border-blue-600' : 'border-green-600';
            
            return (
              <div 
                key={pokemon.id}
                className={`absolute w-full h-full ${bgColor} ${borderColor}`}
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(endAngle * Math.PI / 180)}%)`
                }}
              >
                <div 
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{ transform: `rotate(${startAngle + segmentDegree / 2}deg)` }}
                >
                  <div 
                    className={`w-12 h-12 bg-white rounded-full overflow-hidden relative shadow-lg border-2 ${borderColor}`}
                    style={{ transform: `translateX(100px) rotate(${-startAngle - segmentDegree / 2}deg)` }}
                  >
                    <img 
                      src={pokemon.image} 
                      alt={pokemon.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex flex-col items-center gap-4 mt-4">
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2 shadow-lg"
          disabled={isSpinning || coins <= 0 || wheelPokemons.length === 0}
          onClick={handleSpin}
          size="lg"
        >
          {isSpinning ? 
            (t("spinning") || "Spinning...") : 
            (t("spin-wheel") || "Spin Wheel") + ` (1 ${t("coin") || "Coin"})`
          }
        </Button>
        
        <p className="text-center text-sm text-gray-500">
          {t("you-have") || "You have"} <span className="font-bold">{coins}</span> {coins === 1 ? (t("coin") || "coin") : (t("coins") || "coins")}
        </p>
        
        {selectedPokemonIndex !== null && !isSpinning && !showWinModal && wheelPokemons[selectedPokemonIndex] && (
          <div className="mt-2 animate-fade-in">
            <p>{t("last-spin") || "Last spin"}: <span className="font-bold">{wheelPokemons[selectedPokemonIndex].name}</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonWheel;
