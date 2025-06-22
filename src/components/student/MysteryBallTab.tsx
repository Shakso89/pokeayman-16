
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Coins, Sparkles, Clock, PackageX } from "lucide-react";
import { Pokemon } from "@/types/pokemon";
import { toast } from "sonner";
import MysteryBallResult from "./MysteryBallResult";
import MysteryBallHistory from "./MysteryBallHistory";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  assignPokemonFromSchoolPool, 
  updateStudentCoins,
  addMysteryBallHistory,
  checkDailyAttempt,
  useDailyAttempt,
  getOrCreateStudentProfile
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
  const [sessionOpensCount, setSessionOpensCount] = useState(0);
  const [actualStudentId, setActualStudentId] = useState<string>("");

  const MYSTERY_BALL_COST = 5;
  const MAX_SESSION_OPENS = 10;

  useEffect(() => {
    initializeStudent();
    checkDailyAttemptStatus();
  }, [studentId]);

  const initializeStudent = async () => {
    try {
      // Get or create student profile to get the actual student ID
      const student = await getOrCreateStudentProfile(studentId);
      if (student) {
        setActualStudentId(student.id);
      }
    } catch (error) {
      console.error("Error initializing student:", error);
    }
  };

  const checkDailyAttemptStatus = async () => {
    try {
      if (!actualStudentId) return;
      const available = await checkDailyAttempt(actualStudentId);
      setDailyAttemptAvailable(available);
    } catch (error) {
      console.error("Error checking daily attempt:", error);
      toast.error("Error checking daily attempt");
    }
  };

  const handleOpenMysteryBall = async (isFreeAttempt: boolean) => {
    if (sessionOpensCount >= MAX_SESSION_OPENS) {
      toast.error(`Maximum ${MAX_SESSION_OPENS} opens per session reached!`);
      return;
    }

    if (!isFreeAttempt && coins < MYSTERY_BALL_COST) {
      toast.error(`You need ${MYSTERY_BALL_COST} coins to open the mystery ball!`);
      return;
    }

    if (isFreeAttempt && !dailyAttemptAvailable) {
      toast.error("Daily free attempt not available!");
      return;
    }

    if (!actualStudentId) {
      toast.error("Student profile not initialized!");
      return;
    }
    
    const canWinPokemon = schoolPokemons.length > 0;
    setIsOpening(true);

    try {
      if (isFreeAttempt) {
        const success = await useDailyAttempt(actualStudentId);
        if (!success) {
          toast.error("Failed to use daily attempt!");
          setIsOpening(false);
          return;
        }
        setDailyAttemptAvailable(false); 
      } else {
        const success = await updateStudentCoins(actualStudentId, -MYSTERY_BALL_COST, "Mystery ball purchase");
        if (!success) {
          toast.error("Failed to deduct coins!");
          setIsOpening(false);
          return;
        }
      }
      
      setSessionOpensCount(prev => prev + 1);

      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      const rand = Math.random();
      let resultOutcome;

      if (rand < 0.6 && canWinPokemon) {
        const pokemonResult = await assignPokemonFromSchoolPool(schoolId, actualStudentId);
        
        if (pokemonResult.success && pokemonResult.pokemon) {
          if (pokemonResult.isDuplicate) {
            const coinAmount = 10; 
            await updateStudentCoins(actualStudentId, coinAmount, "Duplicate Pokemon compensation");
            resultOutcome = {
              type: 'coins',
              amount: coinAmount,
              message: `You already have ${pokemonResult.pokemon.name}! Here's ${coinAmount} coins instead.`
            };
            await addMysteryBallHistory(actualStudentId, 'coins', undefined, coinAmount); 
            onCoinsWon(coinAmount);
          } else {
            resultOutcome = {
              type: 'pokemon',
              pokemon: pokemonResult.pokemon,
              message: `Congratulations! You caught ${pokemonResult.pokemon.name}!`
            };
            await addMysteryBallHistory(actualStudentId, 'pokemon', pokemonResult.pokemon);
            onPokemonWon(pokemonResult.pokemon);
          }
        } else {
          const coinAmount = Math.floor(Math.random() * 5) + 1;
          await updateStudentCoins(actualStudentId, coinAmount, "Mystery ball coins");
          resultOutcome = {
            type: 'coins',
            amount: coinAmount,
            message: `The ball contained ${coinAmount} coins!`
          };
          await addMysteryBallHistory(actualStudentId, 'coins', undefined, coinAmount);
          onCoinsWon(coinAmount);
        }
      } else if (rand < 0.9 || (rand < 0.6 && !canWinPokemon)) {
        const coinAmount = Math.floor(Math.random() * 5) + 1;
        await updateStudentCoins(actualStudentId, coinAmount, "Mystery ball coins");
        resultOutcome = {
          type: 'coins',
          amount: coinAmount,
          message: `Lucky! You found ${coinAmount} coins!`
        };
        await addMysteryBallHistory(actualStudentId, 'coins', undefined, coinAmount);
        onCoinsWon(coinAmount);
      } else { 
        resultOutcome = {
          type: 'nothing',
          message: "Better luck next time!"
        };
        await addMysteryBallHistory(actualStudentId, 'nothing');
      }

      setLastResult(resultOutcome);
      setShowResult(true);
      
      onDataRefresh(); 
      if (resultOutcome.type === 'pokemon' || (rand < 0.6 && canWinPokemon)) {
        onRefreshPool(); 
      }

    } catch (error) {
      console.error("Error opening mystery ball:", error);
      toast.error("Error opening mystery ball!");
    } finally {
      setIsOpening(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setLastResult(null);
    if (sessionOpensCount >= MAX_SESSION_OPENS) {
      setSessionOpensCount(0); 
      toast.info("Session reset - you can open mystery balls again!");
    }
  };

  const canOpenWithCoins = coins >= MYSTERY_BALL_COST;
  const canOpenFree = dailyAttemptAvailable;
  const atMaxSessionOpens = sessionOpensCount >= MAX_SESSION_OPENS;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Gift className="h-7 w-7" />
            {t("mystery-ball-title")}
          </CardTitle>
          <p className="text-purple-600">
            {t("mystery-ball-description")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Available Pokémon Pool</span>
              </div>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {isLoading ? "Loading..." : `${schoolPokemons.length} Pokémon`}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-700">Your Coins</span>
              </div>
              <Badge className="bg-yellow-500 text-white">
                {coins} Coins
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <PackageX className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-700">Session Opens</span>
              </div>
              <Badge className={`${atMaxSessionOpens ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                {sessionOpensCount} / {MAX_SESSION_OPENS}
              </Badge>
            </div>

            {dailyAttemptAvailable && !atMaxSessionOpens && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700">Daily Free Attempt</span>
                </div>
                <Badge className="bg-green-500 text-white">
                  Available
                </Badge>
              </div>
            )}

            <div className="space-y-3 pt-2">
              {canOpenFree && !atMaxSessionOpens && (
                <Button
                  onClick={() => handleOpenMysteryBall(true)}
                  disabled={isOpening || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"
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
                      Open Free Mystery Ball
                    </div>
                  )}
                </Button>
              )}

              <Button
                onClick={() => handleOpenMysteryBall(false)}
                disabled={isOpening || isLoading || !canOpenWithCoins || atMaxSessionOpens}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                size="lg"
                variant={!canOpenWithCoins || atMaxSessionOpens ? "outline" : "default"}
              >
                {isOpening ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Opening...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Open Mystery Ball ({MYSTERY_BALL_COST} coins)
                  </div>
                )}
              </Button>
            </div>

            {(!canOpenWithCoins && !canOpenFree && !atMaxSessionOpens) && (
              <p className="text-sm text-gray-500 text-center pt-2">
                You need {MYSTERY_BALL_COST} coins or wait for daily free attempt
              </p>
            )}
            {atMaxSessionOpens && (
              <p className="text-sm text-red-500 text-center font-semibold pt-2">
                Maximum session opens reached!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <MysteryBallHistory studentId={actualStudentId} />

      {showResult && lastResult && (
        <MysteryBallResult
          isOpen={showResult}
          onClose={handleCloseResult}
          result={lastResult}
          pokemon={lastResult.type === 'pokemon' ? lastResult.pokemon : null}
          coins={lastResult.type === 'coins' ? lastResult.amount : 0}
        />
      )}
    </div>
  );
};

export default MysteryBallTab;
