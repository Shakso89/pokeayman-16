
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
  updateStudentCoins,
  addMysteryBallHistory,
  checkDailyAttempt,
  useDailyAttempt,
  getOrCreateStudentProfile
} from "@/services/studentDatabase";
import { assignPokemonFromPool, initializeSchoolPokemonPool, getSchoolAvailablePokemon } from "@/services/schoolPokemonService";

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
  const [actualSchoolPokemons, setActualSchoolPokemons] = useState<Pokemon[]>([]);
  const [poolLoading, setPoolLoading] = useState(false);

  const MYSTERY_BALL_COST = 5;
  const MAX_SESSION_OPENS = 10;

  useEffect(() => {
    console.log("🎰 MysteryBallTab initialized with:", {
      studentId,
      schoolId,
      schoolPokemonsCount: schoolPokemons.length
    });
    
    initializeStudent();
    loadSchoolPokemonPool();
  }, [studentId, schoolId]);

  useEffect(() => {
    if (actualStudentId) {
      checkDailyAttemptStatus();
    }
  }, [actualStudentId]);

  const initializeStudent = async () => {
    try {
      console.log("👤 Initializing student profile...");
      const student = await getOrCreateStudentProfile(studentId);
      if (student) {
        console.log("✅ Student profile initialized:", student.id);
        setActualStudentId(student.user_id || student.id);
      }
    } catch (error) {
      console.error("❌ Error initializing student:", error);
    }
  };

  const loadSchoolPokemonPool = async () => {
    if (!schoolId) {
      console.warn("⚠️ No schoolId provided for loading Pokemon pool");
      return;
    }
    
    setPoolLoading(true);
    try {
      console.log("🏫 Loading school Pokemon pool for:", schoolId);
      
      // First ensure the pool is initialized
      const initSuccess = await initializeSchoolPokemonPool(schoolId);
      if (!initSuccess) {
        console.error("❌ Failed to initialize school Pokemon pool");
        setActualSchoolPokemons([]);
        return;
      }
      
      // Then get available Pokemon
      const availablePokemons = await getSchoolAvailablePokemon(schoolId);
      console.log("📦 Available Pokemon from pool:", availablePokemons.length);
      
      setActualSchoolPokemons(availablePokemons);
      
      // Also update the parent component's state
      onRefreshPool();
    } catch (error) {
      console.error("❌ Error loading school Pokemon pool:", error);
      setActualSchoolPokemons([]);
    } finally {
      setPoolLoading(false);
    }
  };

  const checkDailyAttemptStatus = async () => {
    try {
      if (!actualStudentId) return;
      const available = await checkDailyAttempt(actualStudentId);
      setDailyAttemptAvailable(available);
      console.log("🗓️ Daily attempt available:", available);
    } catch (error) {
      console.error("❌ Error checking daily attempt:", error);
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
    
    // Use the actual school Pokemon pool count - refresh to get latest count
    await loadSchoolPokemonPool();
    const availablePokemonCount = actualSchoolPokemons.length;
    const canWinPokemon = availablePokemonCount > 0;
    
    console.log("🎰 Opening Mystery Ball:", {
      canWinPokemon,
      availablePokemonCount,
      isFreeAttempt,
      actualStudentId,
      schoolId
    });
    
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

      // Add suspense animation
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      const rand = Math.random();
      let resultOutcome;

      if (rand < 0.6 && canWinPokemon) {
        console.log("🎁 Attempting to assign Pokemon from school pool");
        const pokemonResult = await assignPokemonFromPool(schoolId, actualStudentId);
        
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
          console.log("⚠️ Failed to assign Pokemon, giving coins instead");
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
      // Refresh the school pool after opening
      await loadSchoolPokemonPool();

    } catch (error) {
      console.error("❌ Error opening mystery ball:", error);
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
  const currentPokemonCount = actualSchoolPokemons.length;

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-800 text-lg md:text-xl">
            <Gift className="h-6 w-6 md:h-7 md:w-7" />
            {t("mystery-ball-title")}
          </CardTitle>
          <p className="text-purple-600 text-sm md:text-base">
            {t("mystery-ball-description")}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                <span className="font-medium text-sm md:text-base">Available Pokémon Pool</span>
              </div>
              <Badge variant="outline" className="text-purple-600 border-purple-200 text-xs md:text-sm">
                {poolLoading ? "Loading..." : `${currentPokemonCount} Pokémon`}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 md:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                <span className="font-medium text-yellow-700 text-sm md:text-base">Your Coins</span>
              </div>
              <Badge className="bg-yellow-500 text-white text-xs md:text-sm">
                {coins} Coins
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <PackageX className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                <span className="font-medium text-blue-700 text-sm md:text-base">Session Opens</span>
              </div>
              <Badge className={`${atMaxSessionOpens ? 'bg-red-500' : 'bg-blue-500'} text-white text-xs md:text-sm`}>
                {sessionOpensCount} / {MAX_SESSION_OPENS}
              </Badge>
            </div>

            {dailyAttemptAvailable && !atMaxSessionOpens && (
              <div className="flex items-center justify-between p-2 md:p-3 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  <span className="font-medium text-green-700 text-sm md:text-base">Daily Free Attempt</span>
                </div>
                <Badge className="bg-green-500 text-white text-xs md:text-sm">
                  Available
                </Badge>
              </div>
            )}

            {currentPokemonCount === 0 && !poolLoading && (
              <div className="p-2 md:p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-orange-700 text-xs md:text-sm">
                  No Pokémon available in the school pool. Contact your teacher to add Pokémon to the school pool.
                </p>
              </div>
            )}

            <div className="space-y-2 md:space-y-3 pt-2">
              {canOpenFree && !atMaxSessionOpens && (
                <Button
                  onClick={() => handleOpenMysteryBall(true)}
                  disabled={isOpening || poolLoading || currentPokemonCount === 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md text-sm md:text-base"
                  size="lg"
                >
                  {isOpening ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Opening...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 md:h-5 md:w-5" />
                      Open Free Mystery Ball
                    </div>
                  )}
                </Button>
              )}

              <Button
                onClick={() => handleOpenMysteryBall(false)}
                disabled={isOpening || poolLoading || !canOpenWithCoins || atMaxSessionOpens || currentPokemonCount === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md text-sm md:text-base"
                size="lg"
                variant={!canOpenWithCoins || atMaxSessionOpens || currentPokemonCount === 0 ? "outline" : "default"}
              >
                {isOpening ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Opening...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 md:h-5 md:w-5" />
                    Open Mystery Ball ({MYSTERY_BALL_COST} coins)
                  </div>
                )}
              </Button>
            </div>

            {(!canOpenWithCoins && !canOpenFree && !atMaxSessionOpens && currentPokemonCount > 0) && (
              <p className="text-xs md:text-sm text-gray-500 text-center pt-2">
                You need {MYSTERY_BALL_COST} coins or wait for daily free attempt
              </p>
            )}
            {atMaxSessionOpens && (
              <p className="text-xs md:text-sm text-red-500 text-center font-semibold pt-2">
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
