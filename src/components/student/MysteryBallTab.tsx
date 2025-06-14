
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

  const MYSTERY_BALL_COST = 5; // Updated cost
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
      toast.error(t("error-check-daily-attempt"));
    }
  };

  const handleOpenMysteryBall = async (isFreeAttempt: boolean) => {
    if (sessionOpensCount >= MAX_SESSION_OPENS) {
      toast.error(t("max-session-opens-reached-msg").replace("{MAX_SESSION_OPENS}", MAX_SESSION_OPENS.toString()));
      return;
    }

    if (!isFreeAttempt && coins < MYSTERY_BALL_COST) {
      toast.error(t("not-enough-coins-msg").replace("{MYSTERY_BALL_COST}", MYSTERY_BALL_COST.toString()));
      return;
    }

    if (isFreeAttempt && !dailyAttemptAvailable) {
      toast.error(t("daily-attempt-not-available-msg"));
      return;
    }
    
    const canWinPokemon = schoolPokemons.length > 0;

    setIsOpening(true);

    try {
      if (isFreeAttempt) {
        const success = await useDailyAttempt(studentId);
        if (!success) {
          toast.error(t("fail-use-daily-attempt-msg"));
          setIsOpening(false);
          return;
        }
        setDailyAttemptAvailable(false); 
      } else {
        const success = await updateStudentCoins(studentId, -MYSTERY_BALL_COST, MYSTERY_BALL_COST);
        if (!success) {
          toast.error(t("fail-deduct-coins-msg"));
          setIsOpening(false);
          return;
        }
      }
      
      setSessionOpensCount(prev => prev + 1);

      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      const rand = Math.random();
      let resultOutcome;

      if (rand < 0.6 && canWinPokemon) {
        const pokemonResult = await assignPokemonFromSchoolPool(schoolId, studentId);
        
        if (pokemonResult.success && pokemonResult.pokemon) {
          if (pokemonResult.isDuplicate) {
            const coinAmount = 10; 
            await updateStudentCoins(studentId, coinAmount);
            resultOutcome = {
              type: 'coins',
              amount: coinAmount,
              message: t("duplicate-pokemon-msg")
                .replace("{pokemonName}", pokemonResult.pokemon.name)
                .replace("{coinAmount}", coinAmount.toString())
            };
            await addMysteryBallHistory(studentId, 'coins', undefined, coinAmount); 
            onCoinsWon(coinAmount);
          } else {
            resultOutcome = {
              type: 'pokemon',
              pokemon: pokemonResult.pokemon,
              message: t("congrats-caught-pokemon-msg").replace("{pokemonName}", pokemonResult.pokemon.name)
            };
            await addMysteryBallHistory(studentId, 'pokemon', pokemonResult.pokemon);
            onPokemonWon(pokemonResult.pokemon);
          }
        } else {
          const coinAmount = Math.floor(Math.random() * 5) + 1;
          await updateStudentCoins(studentId, coinAmount);
          resultOutcome = {
            type: 'coins',
            amount: coinAmount,
            message: t("ball-had-coins-msg").replace("{coinAmount}", coinAmount.toString())
          };
          await addMysteryBallHistory(studentId, 'coins', undefined, coinAmount);
          onCoinsWon(coinAmount);
        }
      } else if (rand < 0.9 || (rand < 0.6 && !canWinPokemon) ) {
        const coinAmount = Math.floor(Math.random() * 5) + 1;
        await updateStudentCoins(studentId, coinAmount);
        resultOutcome = {
          type: 'coins',
          amount: coinAmount,
          message: t("lucky-found-coins-msg").replace("{coinAmount}", coinAmount.toString())
        };
        await addMysteryBallHistory(studentId, 'coins', undefined, coinAmount);
        onCoinsWon(coinAmount);
      } else { 
        resultOutcome = {
          type: 'nothing',
          message: t("better-luck-next-time-msg")
        };
        await addMysteryBallHistory(studentId, 'nothing');
      }

      setLastResult(resultOutcome);
      setShowResult(true);
      
      onDataRefresh(); 
      if (resultOutcome.type === 'pokemon' || (rand < 0.6 && canWinPokemon)) {
          onRefreshPool(); 
      }

    } catch (error) {
      console.error("Error opening mystery ball:", error);
      toast.error(t("error-opening-mystery-ball"));
    } finally {
      setIsOpening(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setLastResult(null);
    if (sessionOpensCount >= MAX_SESSION_OPENS) {
        setSessionOpensCount(0); 
        toast.info(t("new-session-mystery-ball-msg"));
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
                <span className="font-medium">{t("available-pokemon-pool")}</span>
              </div>
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                {isLoading ? t("loading") : `${schoolPokemons.length} ${t("pokemon")}`}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-700">{t("your-coins")}</span>
              </div>
              <Badge className="bg-yellow-500 text-white">
                {coins} {t("coins")}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <PackageX className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-blue-700">{t("session-opens")}</span>
              </div>
              <Badge className={`${atMaxSessionOpens ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                {sessionOpensCount} / {MAX_SESSION_OPENS}
              </Badge>
            </div>

            {dailyAttemptAvailable && !atMaxSessionOpens && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700">{t("daily-free-attempt")}</span>
                </div>
                <Badge className="bg-green-500 text-white">
                  {t("available")}
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
                      {t("opening")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      {t("open-free-mystery-ball")}
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
                    {t("opening")}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    {t("open-mystery-ball-coins").replace("{MYSTERY_BALL_COST}", MYSTERY_BALL_COST.toString()).replace("{coins}", t("coins"))}
                  </div>
                )}
              </Button>
            </div>

            {(!canOpenWithCoins && !canOpenFree && !atMaxSessionOpens) && (
              <p className="text-sm text-gray-500 text-center pt-2">
                {t("mystery-ball-need-coins-or-wait").replace("{MYSTERY_BALL_COST}", MYSTERY_BALL_COST.toString())}
              </p>
            )}
             {atMaxSessionOpens && (
              <p className="text-sm text-red-500 text-center font-semibold pt-2">
                {t("mystery-ball-max-session-opens")}
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
