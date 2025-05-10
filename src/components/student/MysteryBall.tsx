import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pokemon } from "@/types/pokemon";
import { useToast } from "@/hooks/use-toast";
import { assignRandomPokemonToStudent, useStudentCoin } from "@/utils/pokemon";
import MysteryBallResult from "./MysteryBallResult";
import { CheckCircle, CircleX, PlusCircle, MinusCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile"; 

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
  const [multipleCount, setMultipleCount] = useState(1);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Free daily chance
  const [usedFreeChance, setUsedFreeChance] = useState(dailyAttemptUsed);
  
  useEffect(() => {
    setUsedFreeChance(dailyAttemptUsed);
  }, [dailyAttemptUsed]);
  
  const handleOpenMysteryBall = (count: number = 1) => {
    // Check if there are any Pokémon available
    if (schoolPokemons.length === 0) {
      toast({
        title: "No Pokémon Available",
        description: "There are no Pokémon available in the school pool.",
        variant: "destructive"
      });
      return;
    }

    // Check if the student has a free chance or enough coins
    let isFreeChance = !usedFreeChance && count === 1;
    const requiredCoins = 2 * count - (isFreeChance ? 2 : 0); 
    const hasCoins = coins >= requiredCoins;
    
    if (requiredCoins > 0 && !hasCoins) {
      toast({
        title: "Not Enough Coins",
        description: `You need ${requiredCoins} coins to open ${count} mystery ball${count > 1 ? 's' : ''}.`,
        variant: "destructive"
      });
      return;
    }

    // Spend coins if not using free chance
    if (requiredCoins > 0) {
      const success = useStudentCoin(studentId, requiredCoins);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to use coins. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Mark free chance as used if applicable
    if (isFreeChance) {
      setUsedFreeChance(true);
      setDailyAttemptUsed(true);
      localStorage.setItem(`mysteryBall_dailyAttempt_${studentId}`, new Date().toDateString());
    }

    // Start animation
    setIsAnimating(true);
    processMysteryBallResults(count);
  };
  
  const processMysteryBallResults = (count: number) => {
    const results = {
      pokemon: 0,
      coins: 0,
      coinAmount: 0,
      nothing: 0,
      lastPokemon: null as Pokemon | null
    };
    
    for (let i = 0; i < count; i++) {
      // Determine result (60% chance for Pokémon, 30% for coins, 10% for nothing)
      const random = Math.random();
      if (random < 0.6 && schoolPokemons.length > 0) {
        // Try to assign a Pokemon
        const randomIndex = Math.floor(Math.random() * schoolPokemons.length);
        const pokemon = schoolPokemons[randomIndex];
        
        // Check that we have valid IDs before proceeding
        if (!schoolId || !studentId) {
          console.error("Missing required IDs for Pokemon assignment");
          processCoinReward(results);
          continue;
        }

        // Assign the Pokémon to the student
        const success = assignRandomPokemonToStudent(schoolId, studentId, pokemon.id);
        if (success) {
          results.pokemon++;
          results.lastPokemon = pokemon;
          // If this is the last or only ball, show this Pokemon in the result
          if (i === count - 1) {
            setWonPokemon(pokemon);
            setResult("pokemon");
          }
          onPokemonWon(pokemon);
        } else {
          // Fallback to coins if Pokémon assignment fails
          processCoinReward(results);
        }
      } else if (random < 0.9) {
        processCoinReward(results);
      } else {
        // Nothing found - 10% chance
        results.nothing++;
        if (i === count - 1 && results.pokemon === 0 && results.coins === 0) {
          setResult("nothing");
        }
      }
    }
    
    // After processing all balls, show summary of results
    setTimeout(() => {
      setIsAnimating(false);
      
      // Determine what to show in the result modal
      if (results.pokemon > 0) {
        setResult("pokemon");
        // Last Pokemon won will be shown
      } else if (results.coins > 0) {
        setResult("coins");
        setWonCoins(results.coinAmount);
      } else {
        setResult("nothing");
      }
      
      // Show result modal
      setShowResult(true);
      
      // Show summary toast if multiple balls were opened
      if (count > 1) {
        toast({
          title: "Mystery Balls Opened",
          description: `Results: ${results.pokemon} Pokémon, ${results.coinAmount} coins, ${results.nothing} empty balls`,
        });
      }
    }, 2000);
  };
  
  const processCoinReward = (results: any) => {
    // Award between 1-5 coins
    const coinAmount = Math.floor(Math.random() * 5) + 1;
    results.coins++;
    results.coinAmount += coinAmount;
    
    // If this might be the last result to show
    if (results.pokemon === 0) {
      setResult("coins");
      setWonCoins(results.coinAmount);
    }
    
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
          src="/lovable-uploads/d1db8e93-1b2c-4079-8835-6bc51f236aed.png" 
          alt="Mystery Pokémon Ball" 
          className={`w-40 h-40 cursor-pointer ${isAnimating ? 'animate-bounce' : 'hover:scale-110 transition-transform'}`} 
          onClick={() => isMobile ? handleOpenMysteryBall(1) : null} 
          style={{
            filter: isAnimating ? 'brightness(1.2)' : 'none'
          }} 
        />
      </div>

      {/* Button controls */}
      <div className="mt-4 flex flex-col items-center gap-2">
        {/* Multiple opening counter (desktop only) */}
        {!isMobile && (
          <div className="flex items-center gap-2 mb-2">
            <button 
              onClick={() => setMultipleCount(Math.max(1, multipleCount - 1))}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
              disabled={multipleCount <= 1}
            >
              <MinusCircle size={20} />
            </button>
            <span className="font-medium text-lg mx-2">{multipleCount}</span>
            <button 
              onClick={() => setMultipleCount(Math.min(10, multipleCount + 1))}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
              disabled={multipleCount >= 10}
            >
              <PlusCircle size={20} />
            </button>
          </div>
        )}
        
        {/* Open button */}
        <Button 
          onClick={() => handleOpenMysteryBall(multipleCount)} 
          disabled={isAnimating || (usedFreeChance && coins < 2 * multipleCount)} 
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isAnimating ? "Opening..." : (
            multipleCount > 1 ? 
              `Open ${multipleCount} Balls (${usedFreeChance ? 2 * multipleCount : (2 * multipleCount - 2)} coins)` : 
              `Open ${usedFreeChance ? '(2 coins)' : '(Free)'}`
          )}
        </Button>
        
        {/* Cost indicator */}
        <div className="text-xs text-gray-500 mt-1">
          {usedFreeChance ? 
            `Costs ${2} coins per ball` : 
            "First ball is free today, then 2 coins each"
          }
        </div>
      </div>
      
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
