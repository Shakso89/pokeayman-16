
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Coins, Sparkles, Clock } from "lucide-react";
import { Pokemon } from "@/types/pokemon";
import { toast } from "sonner";
import { MysteryBallResult } from "./MysteryBallResult";
import { MysteryBallHistory } from "./MysteryBallHistory";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  assignPokemonFromSchoolPool, 
  updateStudentCoins,
  addMysteryBallHistory,
  checkDailyAttempt,
  useDailyAttempt 
} from "@/services/studentDatabase";

interface MysteryBallTabProps {
  schoolPokemons: Pokemon[];
  studentId: string;
  schoolId: string;
  coins: number;
  isLoading: boolean;
  onPokemonWon: (pokemon: Pokemon) => void;
  onCoinsWon: (amount: number) => void;
  onRefreshPool: () => void;
  onDataRefresh: () => void;
}

const MysteryBallTab: React.FC<MysteryBallTabProps> = ({
  schoolPokemons,
  studentId,
  schoolId,
  coins,
  isLoading,
  onPokemonWon,
  onCoinsWon,
  onRefreshPool,
  onDataRefresh
}) => {
  const { t } = useTranslation();
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [dailyAttemptAvailable, setDailyAttemptAvailable] = useState(false);

  const MYSTERY_BALL_COST = 50;

  useEffect(() => {
    checkDailyAttemptStatus();
  }, [studentId]);

  const checkDailyAttemptStatus = async () => {
    try {
      const available = await checkDailyAttempt(studentId);
      setDailyAttemptAvailable(available);
    } catch (error) {
      console.error("Error checking daily attempt:", error);
    }
  };

  const handleOpenMysteryBall = async (useCoins: boolean = true) => {
    if (useCoins && coins < MYSTERY_BALL_COST) {
      toast.error("Not enough coins! You need 50 coins to open a Mystery Ball.");
      return;
    }

    if (!useCoins && !dailyAttemptAvailable) {
      toast.error("Daily free attempt already used!");
      return;
    }

    setIsOpening(true);

    try {
      // Deduct coins if using coins
      if (useCoins) {
        const success = await updateStudentCoins(studentId, -MYSTERY_BALL_COST, MYSTERY_BALL_COST);
        if (!success) {
          toast.error("Failed to deduct coins");
          setIsOpening(false);
          return;
        }
      } else {
        // Use daily attempt
        const success = await useDailyAttempt(studentId);
        if (!success) {
          toast.error("Failed to use daily attempt");
          setIsOpening(false);
          return;
        }
        setDailyAttemptAvailable(false);
      }

      // Simulate opening animation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Determine what the student gets
      const rand = Math.random();
      let result;

      if (rand < 0.4) {
        // 40% chance of getting a Pokemon
        const pokemonResult = await assignPokemonFromSchoolPool(schoolId, studentId);
        
        if (pokemonResult.success && pokemonResult.pokemon) {
          if (pokemonResult.isDuplicate) {
            result = {
              type: 'coins',
              amount: 10,
              message: `You already have ${pokemonResult.pokemon.name}! Here's 10 coins instead.`
            };
            await addMysteryBallHistory(studentId, 'coins', undefined, 10);
            onCoinsWon(10);
          } else {
            result = {
              type: 'pokemon',
              pokemon: pokemonResult.pokemon,
              message: `Congratulations! You caught ${pokemonResult.pokemon.name}!`
            };
            await addMysteryBallHistory(studentId, 'pokemon', pokemonResult.pokemon);
            onPokemonWon(pokemonResult.pokemon);
          }
        } else {
          // Fallback to coins if no Pokemon available
          const coinAmount = Math.floor(Math.random() * 20) + 10; // 10-30 coins
          await updateStudentCoins(studentId, coinAmount);
          result = {
            type: 'coins',
            amount: coinAmount,
            message: `No new Pokemon available! Here's ${coinAmount} coins instead.`
          };
          await addMysteryBallHistory(studentId, 'coins', undefined, coinAmount);
          onCoinsWon(coinAmount);
        }
      } else if (rand < 0.7) {
        // 30% chance of getting coins
        const coinAmount = Math.floor(Math.random() * 30) + 20; // 20-50 coins
        await updateStudentCoins(studentId, coinAmount);
        result = {
          type: 'coins',
          amount: coinAmount,
          message: `Lucky! You found ${coinAmount} coins!`
        };
        await addMysteryBallHistory(studentId, 'coins', undefined, coinAmount);
        onCoinsWon(coinAmount);
      } else {
        // 30% chance of getting nothing
        result = {
          type: 'nothing',
          message: "Better luck next time! The Mystery Ball was empty."
        };
        await addMysteryBallHistory(studentId, 'nothing');
      }

      setLastResult(result);
      setShowResult(true);
      
      // Refresh data
      onDataRefresh();
      onRefreshPool();

    } catch (error) {
      console.error("Error opening mystery ball:", error);
      toast.error("Something went wrong opening the Mystery Ball!");
    } finally {
      setIsOpening(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setLastResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Mystery Ball Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Gift className="h-6 w-6" />
            Mystery Ball
          </CardTitle>
          <p className="text-purple-600">
            Open a Mystery Ball to discover Pokemon, coins, or other surprises!
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Available Pokemon Count */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Available Pokemon in School Pool</span>
              </div>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {schoolPokemons.length} Pokemon
              </Badge>
            </div>

            {/* Current Coins */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-700">Your Coins</span>
              </div>
              <Badge className="bg-yellow-500 text-white">
                {coins} coins
              </Badge>
            </div>

            {/* Daily Free Attempt */}
            {dailyAttemptAvailable && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700">Daily Free Attempt</span>
                </div>
                <Badge className="bg-green-500 text-white">
                  Available!
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {dailyAttemptAvailable && (
                <Button
                  onClick={() => handleOpenMysteryBall(false)}
                  disabled={isOpening || isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  size="lg"
                >
                  {isOpening ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Opening...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Open FREE Mystery Ball (Daily)
                    </div>
                  )}
                </Button>
              )}

              <Button
                onClick={() => handleOpenMysteryBall(true)}
                disabled={isOpening || isLoading || coins < MYSTERY_BALL_COST}
                className="w-full bg-purple-500 hover:bg-purple-600"
                size="lg"
                variant={coins < MYSTERY_BALL_COST ? "outline" : "default"}
              >
                {isOpening ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Opening...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Open Mystery Ball (50 coins)
                  </div>
                )}
              </Button>
            </div>

            {coins < MYSTERY_BALL_COST && !dailyAttemptAvailable && (
              <p className="text-sm text-gray-500 text-center">
                You need at least 50 coins to open a Mystery Ball with coins, or wait for your daily free attempt.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mystery Ball History */}
      <MysteryBallHistory studentId={studentId} />

      {/* Result Modal */}
      {showResult && lastResult && (
        <MysteryBallResult
          result={lastResult}
          onClose={handleCloseResult}
        />
      )}
    </div>
  );
};

export default MysteryBallTab;
