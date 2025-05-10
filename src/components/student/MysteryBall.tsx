import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { Package } from "lucide-react";
import { useStudentCoin, assignRandomPokemonToStudent } from "@/utils/pokemon/studentPokemon";
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
}
type BallResult = {
  type: "pokemon" | "coins" | "nothing";
  data?: Pokemon | number;
};
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
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [isOpening, setIsOpening] = useState(false);
  const [result, setResult] = useState<BallResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const determineResult = (): BallResult => {
    // Determine the result: Pokemon (30%), Coins (40%), or Nothing (30%)
    const roll = Math.random() * 100;
    if (roll < 30 && schoolPokemons.length > 0) {
      // Pokemon result - 30% chance
      const randomIndex = Math.floor(Math.random() * schoolPokemons.length);
      const pokemon = schoolPokemons[randomIndex];
      return {
        type: "pokemon",
        data: pokemon
      };
    } else if (roll < 70) {
      // Coin result - 40% chance
      const coinAmount = Math.floor(Math.random() * 5) + 1; // 1-5 coins
      return {
        type: "coins",
        data: coinAmount
      };
    } else {
      // Nothing result - 30% chance
      return {
        type: "nothing"
      };
    }
  };
  const openBall = async (useFreeDailyAttempt: boolean) => {
    if (!useFreeDailyAttempt && coins < 2) {
      toast({
        title: t("not-enough-coins"),
        description: t("need-coins-to-open-ball"),
        variant: "destructive"
      });
      return;
    }
    setIsOpening(true);

    // If not using free attempt, spend 2 coins
    if (!useFreeDailyAttempt) {
      const success = useStudentCoin(studentId, 2);
      if (!success) {
        toast({
          title: t("error"),
          description: t("failed-to-use-coins"),
          variant: "destructive"
        });
        setIsOpening(false);
        return;
      }
    } else {
      // Mark daily attempt as used
      localStorage.setItem(`mysteryBall_dailyAttempt_${studentId}`, new Date().toDateString());
      setDailyAttemptUsed(true);
    }

    // Simulate opening animation
    setTimeout(() => {
      const ballResult = determineResult();
      setResult(ballResult);

      // Process the result
      if (ballResult.type === "pokemon" && ballResult.data) {
        const pokemon = ballResult.data as Pokemon;
        const success = assignRandomPokemonToStudent(schoolId, studentId, pokemon.id);
        if (success) {
          onPokemonWon(pokemon);
        }
      } else if (ballResult.type === "coins" && ballResult.data) {
        const amount = ballResult.data as number;
        onCoinsWon(amount);
      }
      setShowResult(true);
      setIsOpening(false);
    }, 1500);
  };
  const closeResult = () => {
    setShowResult(false);
    setResult(null);
  };
  return <div className="flex flex-col items-center">
      <div className="mb-4 relative w-48 h-48 flex items-center justify-center">
        <img src="/pokeball.png" alt="Mystery Pokémon Ball" className="" />
        {isOpening && <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-t-4 border-purple-500 border-solid rounded-full animate-spin"></div>
          </div>}
      </div>
      
      <div className="flex gap-3 mt-2">
        {!dailyAttemptUsed && <Button onClick={() => openBall(true)} disabled={isOpening} className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
            {t("open-free-daily")}
          </Button>}
        
        <Button onClick={() => openBall(false)} disabled={isOpening || coins < 2} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800">
          <Package className="h-4 w-4" />
          {t("open-for-coins", {
          count: 2
        })}
        </Button>
      </div>
      
      {showResult && result && <MysteryBallResult result={result} onClose={closeResult} />}
    </div>;
};
export default MysteryBall;