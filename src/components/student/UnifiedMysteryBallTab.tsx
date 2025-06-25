
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Coins, Sparkles, Gift } from "lucide-react";
import { openMysteryBall, type PokemonFromPool } from "@/services/unifiedPokemonService";
import { updateStudentCoins } from "@/services/studentDatabase";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/hooks/use-toast";

interface UnifiedMysteryBallTabProps {
  studentId: string;
  onDataUpdate?: () => void;
}

const UnifiedMysteryBallTab: React.FC<UnifiedMysteryBallTabProps> = ({
  studentId,
  onDataUpdate
}) => {
  const { t } = useTranslation();
  const [isOpening, setIsOpening] = useState(false);
  const [lastResult, setLastResult] = useState<{ pokemon?: PokemonFromPool; coins?: number } | null>(null);

  const handleOpenMysteryBall = async () => {
    if (!studentId) {
      toast({
        title: "Error",
        description: "Student ID not found",
        variant: "destructive"
      });
      return;
    }

    setIsOpening(true);
    console.log("🎲 Opening mystery ball for student:", studentId);

    try {
      const result = await openMysteryBall(studentId);
      
      if (result.success) {
        setLastResult({
          pokemon: result.pokemon,
          coins: result.coins
        });

        if (result.pokemon) {
          console.log("🎉 Mystery ball awarded Pokemon:", result.pokemon.name);
          toast({
            title: "🎉 Mystery Ball Opened!",
            description: `You got ${result.pokemon.name}!`,
          });
        } else if (result.coins) {
          console.log("💰 Mystery ball awarded coins:", result.coins);
          
          // Update student coins
          const coinsSuccess = await updateStudentCoins(studentId, result.coins, "Mystery Ball reward");
          
          if (coinsSuccess) {
            toast({
              title: "💰 Mystery Ball Opened!",
              description: `You got ${result.coins} coins!`,
            });
          } else {
            console.error("❌ Failed to update student coins");
            toast({
              title: "Error",
              description: "Failed to update your coins. Please try again.",
              variant: "destructive"
            });
          }
        }

        if (onDataUpdate) {
          onDataUpdate();
        }
      } else {
        console.error("❌ Mystery ball opening failed");
        toast({
          title: "Error",
          description: "Failed to open mystery ball. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Error opening mystery ball:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6 text-purple-500" />
            Mystery Ball
            <Badge variant="outline">Site-Wide Pool</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Open a mystery ball to get a random Pokémon or coins from our shared site-wide pool! 
            Each mystery ball has a 50% chance of giving you a Pokémon and 50% chance of giving you coins.
          </p>
          
          <Button 
            onClick={handleOpenMysteryBall}
            disabled={isOpening}
            size="lg"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
          >
            {isOpening ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                Opening Mystery Ball...
              </>
            ) : (
              <>
                <Gift className="h-5 w-5 mr-2" />
                Open Mystery Ball
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Last Result */}
      {lastResult && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              Last Mystery Ball Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastResult.pokemon ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={lastResult.pokemon.image_url || "/placeholder.svg"}
                    alt={lastResult.pokemon.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{lastResult.pokemon.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{lastResult.pokemon.type_1}</Badge>
                    {lastResult.pokemon.type_2 && (
                      <Badge variant="outline">{lastResult.pokemon.type_2}</Badge>
                    )}
                    <Badge className={`
                      ${lastResult.pokemon.rarity === 'common' ? 'bg-gray-500' : ''}
                      ${lastResult.pokemon.rarity === 'uncommon' ? 'bg-green-500' : ''}
                      ${lastResult.pokemon.rarity === 'rare' ? 'bg-blue-500' : ''}
                      ${lastResult.pokemon.rarity === 'legendary' ? 'bg-purple-500' : ''}
                    `}>
                      {lastResult.pokemon.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Added to your collection from the site-wide pool!
                  </p>
                </div>
              </div>
            ) : lastResult.coins ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Coins className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Coins Reward!</h3>
                  <p className="text-xl font-bold text-yellow-600">+{lastResult.coins} coins</p>
                  <p className="text-sm text-gray-600">Added to your balance!</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Mystery Balls Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 text-sm font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold">Random Rewards</h4>
              <p className="text-sm text-gray-600">50% chance for a Pokémon, 50% chance for coins (1-20)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 text-sm font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold">Site-Wide Pool</h4>
              <p className="text-sm text-gray-600">Pokémon come from our shared site-wide pool used by all schools</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 text-sm font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold">Your Collection</h4>
              <p className="text-sm text-gray-600">You get a copy of the Pokémon in your personal collection</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMysteryBallTab;
