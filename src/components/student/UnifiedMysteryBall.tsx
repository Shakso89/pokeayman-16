
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { openMysteryBall, type PokemonFromPool } from "@/services/unifiedPokemonService";
import { updateStudentCoins } from "@/services/studentDatabase";
import { checkDailyAttempt, useDailyAttempt, addMysteryBallHistory } from "@/services/studentDatabase";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

interface UnifiedMysteryBallProps {
  studentId: string;
  onPokemonWon?: (pokemon: PokemonFromPool) => void;
  onCoinsWon?: (amount: number) => void;
}

const UnifiedMysteryBall: React.FC<UnifiedMysteryBallProps> = ({
  studentId,
  onPokemonWon,
  onCoinsWon
}) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ type: 'pokemon' | 'coins'; pokemon?: PokemonFromPool; coins?: number } | null>(null);
  const [hasUsedDailyAttempt, setHasUsedDailyAttempt] = useState(false);

  React.useEffect(() => {
    checkDailyStatus();
  }, [studentId]);

  const checkDailyStatus = async () => {
    const canAttempt = await checkDailyAttempt(studentId);
    setHasUsedDailyAttempt(!canAttempt);
  };

  const handleSpin = async () => {
    if (hasUsedDailyAttempt) {
      toast({
        title: t("info"),
        description: "You've already used your daily mystery ball attempt!",
        variant: "default"
      });
      return;
    }

    setIsSpinning(true);
    setResult(null);

    try {
      // Use daily attempt
      await useDailyAttempt(studentId);
      setHasUsedDailyAttempt(true);

      // Simulate spinning animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Open mystery ball
      const mysteryResult = await openMysteryBall(studentId);

      if (mysteryResult.success) {
        if (mysteryResult.pokemon) {
          // Won a Pokémon
          setResult({ type: 'pokemon', pokemon: mysteryResult.pokemon });
          
          // Add to history
          await addMysteryBallHistory(studentId, 'pokemon', mysteryResult.pokemon);
          
          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          toast({
            title: "🎉 Congratulations!",
            description: `You caught ${mysteryResult.pokemon.name}!`,
          });

          if (onPokemonWon) {
            onPokemonWon(mysteryResult.pokemon);
          }
        } else if (mysteryResult.coins) {
          // Won coins
          setResult({ type: 'coins', coins: mysteryResult.coins });
          
          // Update student coins
          await updateStudentCoins(studentId, mysteryResult.coins, "Mystery Ball reward");
          
          // Add to history
          await addMysteryBallHistory(studentId, 'coins', undefined, mysteryResult.coins);
          
          // Trigger confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });

          toast({
            title: "💰 Coins!",
            description: `You won ${mysteryResult.coins} coins!`,
          });

          if (onCoinsWon) {
            onCoinsWon(mysteryResult.coins);
          }
        }
      } else {
        throw new Error("Mystery ball failed");
      }
    } catch (error) {
      console.error("Error with mystery ball:", error);
      toast({
        title: t("error"),
        description: "Something went wrong with the mystery ball!",
        variant: "destructive"
      });
      setHasUsedDailyAttempt(false); // Reset on error
    } finally {
      setIsSpinning(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-700 border-gray-300';
      case 'uncommon': return 'text-green-700 border-green-300';
      case 'rare': return 'text-blue-700 border-blue-300';
      case 'legendary': return 'text-purple-700 border-purple-300';
      default: return 'text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">🎯 Mystery Ball</CardTitle>
          <p className="text-center text-sm text-gray-600">
            One free attempt per day! Win Pokémon or coins!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mystery Ball Animation */}
          <div className="text-center">
            <div 
              className={`inline-block text-8xl transition-transform duration-1000 ${
                isSpinning ? 'animate-bounce' : ''
              }`}
            >
              ⚪
            </div>
          </div>

          {/* Spin Button */}
          <div className="text-center">
            <Button
              onClick={handleSpin}
              disabled={isSpinning || hasUsedDailyAttempt}
              size="lg"
              className="w-full"
            >
              {isSpinning ? "Opening..." : hasUsedDailyAttempt ? "Used Today" : "Open Mystery Ball"}
            </Button>
            {hasUsedDailyAttempt && (
              <p className="text-xs text-gray-500 mt-2">
                Come back tomorrow for another attempt!
              </p>
            )}
          </div>

          {/* Result Display */}
          {result && (
            <div className="text-center space-y-4 p-4 bg-gray-50 rounded-lg">
              {result.type === 'pokemon' && result.pokemon && (
                <div className="space-y-2">
                  <div className="text-lg font-bold">🎉 You caught a Pokémon!</div>
                  <div className="flex justify-center">
                    <img
                      src={result.pokemon.image_url || "/placeholder.svg"}
                      alt={result.pokemon.name}
                      className="w-24 h-24 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="font-semibold text-lg">{result.pokemon.name}</div>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline">{result.pokemon.type_1}</Badge>
                    {result.pokemon.type_2 && (
                      <Badge variant="outline">{result.pokemon.type_2}</Badge>
                    )}
                  </div>
                  <Badge className={getRarityColor(result.pokemon.rarity)}>
                    {result.pokemon.rarity}
                  </Badge>
                </div>
              )}
              
              {result.type === 'coins' && result.coins && (
                <div className="space-y-2">
                  <div className="text-lg font-bold">💰 You won coins!</div>
                  <div className="text-3xl">🪙</div>
                  <div className="text-xl font-semibold">{result.coins} coins</div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>• 70% chance to win a Pokémon</p>
            <p>• 30% chance to win 5-20 coins</p>
            <p>• Free attempt resets daily</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMysteryBall;
