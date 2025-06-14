
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Coins, Sparkles, Clock, PackageX } from "lucide-react"; // Added PackageX for nothing
import { Pokemon } from "@/types/pokemon";
import { toast } from "sonner";
import MysteryBallResult from "./MysteryBallResult";
import MysteryBallHistory from "./MysteryBallHistory"; // Assuming this is MysteryBallHistoryDatabase
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
  const [sessionOpensCount, setSessionOpensCount] = useState(0);

  const MYSTERY_BALL_COST = 2; // Updated cost
  const MAX_SESSION_OPENS = 10;

  useEffect(() => {
    checkDailyAttemptStatus();
  }, [studentId]);

  const checkDailyAttemptStatus = async () => {
    try {
      const available = await checkDailyAttempt(studentId);
      setDailyAttemptAvailable(available);
    } catch (error) {
      console.error("Error checking daily attempt:", error);
      toast.error("Could not check daily attempt status.");
    }
  };

  const handleOpenMysteryBall = async (isFreeAttempt: boolean) => {
    if (sessionOpensCount >= MAX_SESSION_OPENS) {
      toast.error(`You have reached the maximum of ${MAX_SESSION_OPENS} opens for this session.`);
      return;
    }

    if (!isFreeAttempt && coins < MYSTERY_BALL_COST) {
      toast.error(`Not enough coins! You need ${MYSTERY_BALL_COST} coins to open a Mystery Ball.`);
      return;
    }

    if (isFreeAttempt && !dailyAttemptAvailable) {
      // This case should ideally be prevented by button disable state, but as a safeguard:
      toast.error("Daily free attempt already used or not available.");
      return;
    }
    
    // Check for empty school pool before spending resources if the main reward is Pokemon
    // This check is primarily for the 60% Pokemon chance. If it's empty, we'll skip to coins/nothing.
    const canWinPokemon = schoolPokemons.length > 0;

    setIsOpening(true);

    try {
      if (isFreeAttempt) {
        const success = await useDailyAttempt(studentId);
        if (!success) {
          toast.error("Failed to use daily attempt. Please try again.");
          setIsOpening(false);
          return;
        }
        setDailyAttemptAvailable(false); // Mark as used for the current UI session
      } else {
        const success = await updateStudentCoins(studentId, -MYSTERY_BALL_COST, MYSTERY_BALL_COST);
        if (!success) {
          toast.error("Failed to deduct coins. Please try again.");
          setIsOpening(false);
          return;
        }
      }
      
      setSessionOpensCount(prev => prev + 1);

      // Simulate opening animation delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      const rand = Math.random();
      let resultOutcome;

      if (rand < 0.6 && canWinPokemon) { // 60% chance for Pokemon
        const pokemonResult = await assignPokemonFromSchoolPool(schoolId, studentId);
        
        if (pokemonResult.success && pokemonResult.pokemon) {
          if (pokemonResult.isDuplicate) {
            const coinAmount = 10; // Fixed coin amount for duplicate Pokemon
            await updateStudentCoins(studentId, coinAmount);
            resultOutcome = {
              type: 'coins',
              amount: coinAmount,
              message: `You already have ${pokemonResult.pokemon.name}! Here's ${coinAmount} coins instead.`
            };
            await addMysteryBallHistory(studentId, 'coins', undefined, coinAmount, pokemonResult.pokemon.name); // Log duplicate
            onCoinsWon(coinAmount);
          } else {
            resultOutcome = {
              type: 'pokemon',
              pokemon: pokemonResult.pokemon,
              message: `Congratulations! You caught ${pokemonResult.pokemon.name}!`
            };
            await addMysteryBallHistory(studentId, 'pokemon', pokemonResult.pokemon);
            onPokemonWon(pokemonResult.pokemon);
          }
        } else {
          // Fallback to coins if Pokemon assignment failed or pool was empty despite initial check
          const coinAmount = Math.floor(Math.random() * 5) + 1; // 1-5 coins
          await updateStudentCoins(studentId, coinAmount);
          resultOutcome = {
            type: 'coins',
            amount: coinAmount,
            message: `The ball had some coins! You found ${coinAmount} coins.`
          };
          await addMysteryBallHistory(studentId, 'coins', undefined, coinAmount);
          onCoinsWon(coinAmount);
        }
      } else if (rand < 0.9 || (rand < 0.6 && !canWinPokemon) ) { // 30% chance for coins (0.6 to 0.9), or if Pokemon was target but pool empty
        const coinAmount = Math.floor(Math.random() * 5) + 1; // 1-5 coins
        await updateStudentCoins(studentId, coinAmount);
        resultOutcome = {
          type: 'coins',
          amount: coinAmount,
          message: `Lucky! You found ${coinAmount} coins!`
        };
        await addMysteryBallHistory(studentId, 'coins', undefined, coinAmount);
        onCoinsWon(coinAmount);
      } else { // 10% chance for nothing
        resultOutcome = {
          type: 'nothing',
          message: "Better luck next time! The Mystery Ball was empty."
        };
        await addMysteryBallHistory(studentId, 'nothing');
      }

      setLastResult(resultOutcome);
      setShowResult(true);
      
      onDataRefresh(); // Refresh student's general data (coins, etc.)
      if (resultOutcome.type === 'pokemon' || (rand < 0.6 && canWinPokemon)) { // Refresh pool if a pokemon was potentially taken
          onRefreshPool(); 
      }

    } catch (error) {
      console.error("Error opening mystery ball:", error);
      toast.error("Something went wrong opening the Mystery Ball!");
      // Optionally, refund coins if payment was made but process failed critically before reward
      // This part needs careful consideration of where the error occurred.
    } finally {
      setIsOpening(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setLastResult(null);
    if (sessionOpensCount >= MAX_SESSION_OPENS) {
        // Reset session count if max was reached and modal is closed
        // Or simply let it persist until next page load / day
        // For now, we'll reset if they hit the cap and close.
        setSessionOpensCount(0); 
        toast.info("New session started for Mystery Ball.");
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
            {t("mystery-ball-title", "Mystery Ball")}
          </CardTitle>
          <p className="text-purple-600">
            {t("mystery-ball-description", "Open a Mystery Ball to discover Pokemon, coins, or other surprises!")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span className="font-medium">{t("available-pokemon-pool", "Available Pokemon in School Pool")}</span>
              </div>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {isLoading ? t("loading", "Loading...") : `${schoolPokemons.length} ${t("pokemon", "Pokemon")}`}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-700">{t("your-coins", "Your Coins")}</span>
              </div>
              <Badge className="bg-yellow-500 text-white">
                {coins} {t("coins", "coins")}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <PackageX className="h-5 w-5 text-blue-500" /> {/* Using PackageX as a generic "attempts" icon */}
                <span className="font-medium text-blue-700">{t("session-opens", "Session Opens")}</span>
              </div>
              <Badge className={`${atMaxSessionOpens ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                {sessionOpensCount} / {MAX_SESSION_OPENS}
              </Badge>
            </div>

            {dailyAttemptAvailable && !atMaxSessionOpens && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700">{t("daily-free-attempt", "Daily Free Attempt")}</span>
                </div>
                <Badge className="bg-green-500 text-white">
                  {t("available", "Available!")}
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
                      {t("opening", "Opening...")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      {t("open-free-mystery-ball", "Open FREE Mystery Ball (Daily)")}
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
                    {t("opening", "Opening...")}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    {t("open-mystery-ball-coins", "Open Mystery Ball")} ({MYSTERY_BALL_COST} {t("coins", "coins")})
                  </div>
                )}
              </Button>
            </div>

            {(!canOpenWithCoins && !canOpenFree && !atMaxSessionOpens) && (
              <p className="text-sm text-gray-500 text-center pt-2">
                {t("mystery-ball-need-coins-or-wait", `You need ${MYSTERY_BALL_COST} coins or wait for your daily free attempt.`)}
              </p>
            )}
             {atMaxSessionOpens && (
              <p className="text-sm text-red-500 text-center font-semibold pt-2">
                {t("mystery-ball-max-session-opens", "Maximum opens for this session reached.")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <MysteryBallHistory studentId={studentId} />

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

