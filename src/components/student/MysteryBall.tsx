
// Adding the clickToOpen property to the component to enable direct clicking on the image

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pokemon } from "@/types/pokemon";
import { useToast } from "@/hooks/use-toast";
import { assignRandomPokemonToStudent, useStudentCoin } from "@/utils/pokemonData";
import MysteryBallResult from "./MysteryBallResult";

interface MysteryBallProps {
  studentId: string;
  schoolId: string;
  coins: number;
  schoolPokemons: Pokemon[];
  onPokemonWon: (pokemon: Pokemon) => void;
  onCoinsWon: (amount: number) => void;
  dailyAttemptUsed: boolean;
  setDailyAttemptUsed: (used: boolean) => void;
  clickToOpen?: boolean; // New prop to enable clicking directly on the image
}

const MysteryBall: React.FC<MysteryBallProps> = ({
  studentId,
  schoolId,
  coins,
  schoolPokemons,
  onPokemonWon,
  onCoinsWon,
  dailyAttemptUsed,
  setDailyAttemptUsed,
  clickToOpen = false, // Default to false for backward compatibility
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<"pokemon" | "coins" | null>(null);
  const [wonPokemon, setWonPokemon] = useState<Pokemon | null>(null);
  const [wonCoins, setWonCoins] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();
  
  // Free daily chance
  const [usedFreeChance, setUsedFreeChance] = useState(dailyAttemptUsed);

  useEffect(() => {
    setUsedFreeChance(dailyAttemptUsed);
  }, [dailyAttemptUsed]);

  const handleOpenMysteryBall = () => {
    // Check if there are any Pokémon available
    if (schoolPokemons.length === 0) {
      toast({
        title: "No Pokémon Available",
        description: "There are no Pokémon available in the school pool.",
        variant: "destructive",
      });
      return;
    }

    // Check if the student has a free chance or enough coins
    const isFreeChance = !usedFreeChance;
    const hasCoins = coins >= 1;

    if (!isFreeChance && !hasCoins) {
      toast({
        title: "Not Enough Coins",
        description: "You need 1 coin to open the mystery ball.",
        variant: "destructive",
      });
      return;
    }

    // Spend coins if not using free chance
    if (!isFreeChance) {
      const success = useStudentCoin(studentId, 1);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to use a coin. Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Mark free chance as used
      setUsedFreeChance(true);
      setDailyAttemptUsed(true);
      localStorage.setItem(`mysteryBall_dailyAttempt_${studentId}`, new Date().toDateString());
    }

    // Start animation
    setIsAnimating(true);

    // Determine result (70% chance for Pokémon, 30% for coins)
    const isWinningPokemon = Math.random() < 0.7;

    setTimeout(() => {
      if (isWinningPokemon && schoolPokemons.length > 0) {
        // Get a random Pokémon index
        const randomIndex = Math.floor(Math.random() * schoolPokemons.length);
        const pokemon = schoolPokemons[randomIndex];
        
        // Assign the Pokémon to the student
        const success = assignRandomPokemonToStudent(schoolId, studentId, pokemon.id);
        
        if (success) {
          setResult("pokemon");
          setWonPokemon(pokemon);
          // Call the parent component's callback
          onPokemonWon(pokemon);
        } else {
          // Fallback to coins if Pokémon assignment fails
          handleCoinReward();
        }
      } else {
        handleCoinReward();
      }
      
      setIsAnimating(false);
      setShowResult(true);
    }, 2000);
  };
  
  const handleCoinReward = () => {
    // Award between 1-5 coins
    const coinAmount = Math.floor(Math.random() * 5) + 1;
    setResult("coins");
    setWonCoins(coinAmount);
    // Call the parent component's callback
    onCoinsWon(coinAmount);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResult(null);
    setWonPokemon(null);
    setWonCoins(0);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Mystery Ball Image */}
      <div className="relative">
        <img
          src="/pokeball.png"
          alt="Mystery Pokémon Ball"
          className={`w-40 h-40 cursor-pointer ${isAnimating ? 'animate-bounce' : 'hover:scale-110 transition-transform'}`}
          onClick={clickToOpen ? handleOpenMysteryBall : undefined}
          style={{ filter: isAnimating ? 'brightness(1.2)' : 'none' }}
        />
        {usedFreeChance && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            1 coin
          </div>
        )}
      </div>

      {/* Button below the ball (only show if clickToOpen is false) */}
      {!clickToOpen && (
        <Button
          onClick={handleOpenMysteryBall}
          disabled={isAnimating || (usedFreeChance && coins < 1)}
          className="mt-4 bg-blue-500 hover:bg-blue-600"
        >
          {isAnimating ? "Opening..." : usedFreeChance ? `Open (1 coin)` : "Open (Free)"}
        </Button>
      )}
      
      {/* Result Modal */}
      <MysteryBallResult 
        isOpen={showResult} 
        onClose={handleCloseResult}
        result={result}
        pokemon={wonPokemon}
        coins={wonCoins}
      />
    </div>
  );
};

export default MysteryBall;
