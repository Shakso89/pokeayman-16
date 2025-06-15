import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pokemon } from "@/types/pokemon";
import { useToast } from "@/hooks/use-toast";
import { assignRandomPokemonToStudent, useStudentCoin } from "@/utils/pokemon";
import MysteryBallResult from "./MysteryBallResult";
import { useIsMobile } from "@/hooks/use-mobile";
import { v4 as uuidv4 } from "uuid";

interface MysteryBallProps {
  studentId: string;
  schoolId: string;
  coins: number;
  schoolPokemons: Pokemon[];
  onPokemonWon: (pokemon: Pokemon) => void;
  onCoinsWon: (amount: number) => void;
  dailyAttemptUsed: boolean;
  setDailyAttemptUsed: (used: boolean) => void;
}

const MysteryBall: React.FC<MysteryBallProps> = ({
  studentId,
  schoolId,
  coins,
  schoolPokemons,
  onPokemonWon,
  onCoinsWon,
  dailyAttemptUsed,
  setDailyAttemptUsed
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<"pokemon" | "coins" | "nothing" | null>(null);
  const [wonPokemon, setWonPokemon] = useState<Pokemon | null>(null);
  const [wonCoins, setWonCoins] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Free daily chance
  const [usedFreeChance, setUsedFreeChance] = useState(dailyAttemptUsed);
  
  useEffect(() => {
    setUsedFreeChance(dailyAttemptUsed);
  }, [dailyAttemptUsed]);

  // Save history to localStorage
  const saveToHistory = (resultType: "pokemon" | "coins" | "nothing", pokemon?: Pokemon, coinsAmount?: number) => {
    try {
      const historyItem = {
        id: uuidv4(),
        studentId,
        date: new Date().toISOString(),
        type: resultType,
        pokemonData: pokemon ? {
          id: pokemon.id,
          name: pokemon.name,
          image: pokemon.image,
          type: pokemon.type,
          rarity: pokemon.rarity
        } : undefined,
        coinsAmount
      };

      const existingHistory = JSON.parse(localStorage.getItem(`mysteryBallHistory_${studentId}`) || "[]");
      existingHistory.push(historyItem);
      localStorage.setItem(`mysteryBallHistory_${studentId}`, JSON.stringify(existingHistory));
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  const handleOpenMysteryBall = () => {
    // Check if there are any Pokémon available
    if (schoolPokemons.length === 0) {
      toast({
        title: "No Pokémon Available",
        description: "There are no Pokémon available in the school pool.",
        variant: "destructive"
      });
      return;
    }

    // Check if the student has a free chance or enough coins (changed to 5 coins)
    const isFreeChance = !usedFreeChance;
    const requiredCoins = 5;
    const hasCoins = coins >= requiredCoins;
    
    if (!isFreeChance && !hasCoins) {
      toast({
        title: "Not Enough Coins",
        description: `You need ${requiredCoins} coins to open the mystery ball.`,
        variant: "destructive"
      });
      return;
    }

    // Spend coins if not using free chance
    if (!isFreeChance) {
      // Simple coin check - in real implementation this would be handled by the backend
      console.log(`Using ${requiredCoins} coins for student ${studentId}`);
    } else {
      // Mark free chance as used
      setUsedFreeChance(true);
      setDailyAttemptUsed(true);
      localStorage.setItem(`mysteryBall_dailyAttempt_${studentId}`, new Date().toDateString());
    }

    // Start animation
    setIsAnimating(true);

    // Determine result (60% chance for Pokémon, 30% for coins, 10% for nothing)
    const random = Math.random();
    setTimeout(() => {
      if (random < 0.6 && schoolPokemons.length > 0) {
        // Get a random Pokémon from the pool
        const randomIndex = Math.floor(Math.random() * schoolPokemons.length);
        const pokemon = schoolPokemons[randomIndex];

        if (!schoolId) {
          console.error("Missing school ID for Pokemon assignment");
          handleCoinReward();
          return;
        }

        console.log("Attempting to assign Pokemon via mystery ball:", {
          schoolId,
          studentId,
          pokemonId: pokemon.id,
          pokemonName: pokemon.name
        });

        // Use the assignRandomPokemonToStudent function instead
        assignRandomPokemonToStudent(schoolId, studentId).then((result) => {
          if (result.success && result.pokemon) {
            console.log("Successfully assigned Pokemon via mystery ball:", result.pokemon.name);
            setResult("pokemon");
            setWonPokemon(result.pokemon);
            onPokemonWon(result.pokemon);
            saveToHistory("pokemon", result.pokemon);
          } else {
            console.error("Failed to assign Pokemon via mystery ball");
            handleCoinReward();
          }
        });
      } else if (random < 0.9) {
        handleCoinReward();
      } else {
        // Nothing found - 10% chance
        setResult("nothing");
        saveToHistory("nothing");
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
    onCoinsWon(coinAmount);
    saveToHistory("coins", undefined, coinAmount);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResult(null);
    setWonPokemon(null);
    setWonCoins(0);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Mystery Ball Image - clickable */}
      <div className="relative">
        <img 
          alt="Mystery Pokémon Ball" 
          onClick={handleOpenMysteryBall} 
          style={{
            filter: isAnimating ? 'brightness(1.2)' : 'none',
            cursor: isAnimating ? 'default' : 'pointer'
          }} 
          src="/lovable-uploads/57010b7a-2317-4f83-ab99-70ecff681e4d.png" 
          className="w-32 h-32 object-contain hover:scale-105 transition-transform" 
        />
      </div>

      {/* Button below the ball */}
      <Button 
        onClick={handleOpenMysteryBall} 
        disabled={isAnimating || (usedFreeChance && coins < 5)} 
        className="mt-4 bg-blue-500 hover:bg-blue-600"
      >
        {isAnimating ? "Opening..." : usedFreeChance ? `Open (5 coins)` : "Open (Free)"}
      </Button>
      
      {/* Result Modal */}
      <MysteryBallResult 
        isOpen={showResult} 
        onClose={handleCloseResult} 
        result={{
          type: result || "nothing",
          data: result === "pokemon" ? wonPokemon : result === "coins" ? wonCoins : undefined
        }} 
        pokemon={wonPokemon} 
        coins={wonCoins} 
      />
    </div>
  );
};

export default MysteryBall;
