
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package, Gift } from "lucide-react";
import { Pokemon } from "@/types/pokemon";
import MysteryBall from "@/components/student/MysteryBall";

interface MysteryBallTabProps {
  schoolPokemons: Pokemon[];
  studentId: string;
  schoolId: string;
  coins: number;
  isLoading: boolean;
  onPokemonWon: (pokemon: Pokemon) => void;
  onCoinsWon: (amount: number) => void;
  onRefreshPool: () => void;
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
}) => {
  const [dailyAttemptUsed, setDailyAttemptUsed] = useState(() => {
    // Check if user has used their daily attempt today
    const lastAttemptDate = localStorage.getItem(`mysteryBall_dailyAttempt_${studentId}`);
    const today = new Date().toDateString();
    return lastAttemptDate === today;
  });
  
  return (
    <Card className="mx-auto max-w-xl shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-md relative">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12">
          <img
            src="/lovable-uploads/b11bcb27-9dd4-43ab-8112-ea075303ce55.png"
            alt="PokéAyman"
            className="w-full h-full object-contain"
          />
        </div>
        <CardTitle className="text-2xl pt-4">Mystery Pokémon Ball</CardTitle>
        <CardDescription className="text-white opacity-90">
          Open a mystery ball and win a Pokémon or coins!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {schoolPokemons.length === 0 ? (
          <div className="text-center p-8">
            <p className="mb-4 text-lg text-gray-700">No available Pokémon</p>
            <Button
              onClick={onRefreshPool}
              className="mx-auto flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              {isLoading ? "Checking..." : "Check Availability"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <MysteryBall 
              studentId={studentId} 
              schoolId={schoolId}
              coins={coins}
              schoolPokemons={schoolPokemons}
              onPokemonWon={onPokemonWon}
              onCoinsWon={onCoinsWon}
              dailyAttemptUsed={dailyAttemptUsed}
              setDailyAttemptUsed={setDailyAttemptUsed}
              clickToOpen={true}
            />
            
            <div className="mt-6 text-center">
              <p className="mb-2 text-sm font-medium">Mystery ball contains:</p>
              <div className="flex justify-center gap-4 mt-3">
                <div className="flex items-center gap-1 bg-purple-100 rounded-full px-3 py-1">
                  <Gift className="h-4 w-4 text-purple-500" />
                  <span className="text-xs">Random Pokémon</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-100 rounded-full px-3 py-1">
                  <Package className="h-4 w-4 text-amber-500" />
                  <span className="text-xs">Bonus Coins</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MysteryBallTab;
