
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { getRandomPokemonFromPool, awardPokemonToStudent, type PokemonFromPool } from "@/services/unifiedPokemonService";
import { updateStudentCoins, addMysteryBallHistory } from "@/services/studentDatabase";
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

  const MYSTERY_BALL_COST = 10;

  const handleSpin = async () => {
    setIsSpinning(true);
    setResult(null);

    try {
      console.log("🎲 Starting mystery ball from site-wide Pokemon pool for student:", studentId);

      // First deduct coins
      const coinSuccess = await updateStudentCoins(studentId, -MYSTERY_BALL_COST, "Mystery Ball purchase");
      if (!coinSuccess) {
        toast({
          title: "Error",
          description: "Not enough coins for mystery ball!",
          variant: "destructive"
        });
        return;
      }

      // Simulate spinning animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 50% chance for Pokemon from shared pool, 50% chance for coins
      const isPokemon = Math.random() < 0.5;

      if (isPokemon) {
        console.log("🎯 Mystery ball: Trying to award Pokemon from shared site-wide pool");
        
        // Get random Pokemon from shared site-wide pool
        const randomPokemon = await getRandomPokemonFromPool();
        
        if (randomPokemon) {
          // Award a copy to student's collection (original stays in shared pool)
          const success = await awardPokemonToStudent(studentId, randomPokemon.id, 'mystery_ball');

          if (success) {
            console.log(`✅ Pokemon copy awarded from shared pool: ${randomPokemon.name}`);
            
            setResult({ type: 'pokemon', pokemon: randomPokemon });
            
            // Add to history
            await addMysteryBallHistory(studentId, 'pokemon', randomPokemon);
            
            // Trigger confetti
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });

            toast({
              title: "🎉 Congratulations!",
              description: `You caught ${randomPokemon.name} from the site pool!`,
            });

            if (onPokemonWon) {
              onPokemonWon(randomPokemon);
            }
          } else {
            throw new Error("Failed to award Pokemon copy");
          }
        } else {
          throw new Error("No Pokemon available in shared pool");
        }
      } else {
        // Award coins (1-20 coins)
        const coinAmount = Math.floor(Math.random() * 20) + 1;
        console.log("💰 Mystery ball: Awarding coins:", coinAmount);
        
        const success = await updateStudentCoins(studentId, coinAmount, "Mystery Ball reward");
        
        if (success) {
          setResult({ type: 'coins', coins: coinAmount });
          
          // Add to history
          await addMysteryBallHistory(studentId, 'coins', undefined, coinAmount);
          
          // Trigger confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });

          toast({
            title: "💰 Coins!",
            description: `You won ${coinAmount} coins!`,
          });

          if (onCoinsWon) {
            onCoinsWon(coinAmount);
          }
        } else {
          throw new Error("Failed to award coins");
        }
      }

    } catch (error) {
      console.error("❌ Mystery ball error:", error);
      
      // Refund coins on any error
      await updateStudentCoins(studentId, MYSTERY_BALL_COST, "Mystery Ball refund");
      
      toast({
        title: "Error",
        description: "Something went wrong with the mystery ball! Coins refunded.",
        variant: "destructive"
      });
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
          <CardTitle className="text-center">🎯 Site-Wide Mystery Pokéball</CardTitle>
          <p className="text-center text-sm text-gray-600">
            {MYSTERY_BALL_COST} coins per use! Win 1-20 coins or a random Pokémon from our shared site pool!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pokéball Animation */}
          <div className="text-center">
            <div 
              className={`inline-block transition-transform duration-1000 ${
                isSpinning ? 'animate-bounce' : ''
              }`}
            >
              <div className="w-20 h-20 mx-auto relative">
                {/* Pokéball design */}
                <div className="w-full h-full rounded-full bg-gradient-to-b from-red-500 to-red-600 relative overflow-hidden border-4 border-gray-800">
                  {/* Top half */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-400 to-red-500"></div>
                  {/* Bottom half */}
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-100 to-white"></div>
                  {/* Center line */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 transform -translate-y-1/2"></div>
                  {/* Center button */}
                  <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full border-2 border-gray-800 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto mt-1"></div>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute top-2 left-2 w-3 h-3 bg-white opacity-60 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Spin Button */}
          <div className="text-center">
            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              size="lg"
              className="w-full"
            >
              {isSpinning ? "Opening..." : `Open Mystery Pokéball (${MYSTERY_BALL_COST} coins)`}
            </Button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="text-center space-y-4 p-4 bg-gray-50 rounded-lg">
              {result.type === 'pokemon' && result.pokemon && (
                <div className="space-y-2">
                  <div className="text-lg font-bold">🎉 You caught a Pokémon from the site pool!</div>
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
            <p>• 50% chance to win a random Pokémon from our shared site pool</p>
            <p>• 50% chance to win 1-20 coins</p>
            <p>• Costs {MYSTERY_BALL_COST} coins per use</p>
            <p>• Pokémon pool is shared across all schools</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMysteryBall;
