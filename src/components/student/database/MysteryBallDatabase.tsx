
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pokemon } from "@/types/pokemon";
import { useToast } from "@/hooks/use-toast";
import MysteryBallResult from "../MysteryBallResult";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  updateStudentCoins, 
  addPokemonToCollection, 
  addMysteryBallHistory,
  checkDailyAttempt,
  useDailyAttempt,
  assignPokemonFromSchoolPool
} from "@/services/studentDatabase";

interface MysteryBallDatabaseProps {
  studentId: string;
  schoolId: string;
  coins: number;
  schoolPokemons: Pokemon[];
  onPokemonWon: (pokemon: Pokemon) => void;
  onCoinsWon: (amount: number) => void;
  onDataRefresh: () => void;
}

const MysteryBallDatabase: React.FC<MysteryBallDatabaseProps> = ({
  studentId,
  schoolId,
  coins,
  schoolPokemons,
  onPokemonWon,
  onCoinsWon,
  onDataRefresh
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<"pokemon" | "coins" | "nothing" | null>(null);
  const [wonPokemon, setWonPokemon] = useState<Pokemon | null>(null);
  const [wonCoins, setWonCoins] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [dailyAttemptAvailable, setDailyAttemptAvailable] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    checkDailyAttemptAvailability();
  }, [studentId]);

  const checkDailyAttemptAvailability = async () => {
    const available = await checkDailyAttempt(studentId);
    setDailyAttemptAvailable(available);
  };

  const handleOpenMysteryBall = async () => {
    if (schoolPokemons.length === 0) {
      toast({
        title: "No Pokémon Available",
        description: "There are no Pokémon available in the school pool.",
        variant: "destructive"
      });
      return;
    }

    const isFreeChance = dailyAttemptAvailable;
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

    setIsAnimating(true);

    // Use daily attempt or deduct coins
    if (isFreeChance) {
      await useDailyAttempt(studentId);
      setDailyAttemptAvailable(false);
    } else {
      await updateStudentCoins(studentId, -requiredCoins, requiredCoins);
    }

    // Determine result (60% chance for Pokémon, 30% for coins, 10% for nothing)
    const random = Math.random();
    
    setTimeout(async () => {
      try {
        if (random < 0.6 && schoolPokemons.length > 0) {
          // Pokemon result
          const assignResult = await assignPokemonFromSchoolPool(schoolId, studentId);
          
          if (assignResult.success && assignResult.pokemon) {
            setResult("pokemon");
            setWonPokemon(assignResult.pokemon);
            onPokemonWon(assignResult.pokemon);
            await addMysteryBallHistory(studentId, "pokemon", assignResult.pokemon);
          } else {
            // Fallback to coins if assignment failed
            await handleCoinReward();
          }
        } else if (random < 0.9) {
          await handleCoinReward();
        } else {
          // Nothing found - 10% chance
          setResult("nothing");
          await addMysteryBallHistory(studentId, "nothing");
        }
      } catch (error) {
        console.error('Error in mystery ball:', error);
        await handleCoinReward();
      } finally {
        setIsAnimating(false);
        setShowResult(true);
        onDataRefresh();
      }
    }, 2000);
  };

  const handleCoinReward = async () => {
    const coinAmount = Math.floor(Math.random() * 5) + 1;
    setResult("coins");
    setWonCoins(coinAmount);
    await updateStudentCoins(studentId, coinAmount);
    await addMysteryBallHistory(studentId, "coins", undefined, coinAmount);
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

      <Button 
        onClick={handleOpenMysteryBall} 
        disabled={isAnimating || (!dailyAttemptAvailable && coins < 5)} 
        className="mt-4 bg-blue-500 hover:bg-blue-600"
      >
        {isAnimating ? "Opening..." : dailyAttemptAvailable ? "Open (Free)" : "Open (5 coins)"}
      </Button>
      
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

export default MysteryBallDatabase;
