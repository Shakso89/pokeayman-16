
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package, Gift, X, Dice6 } from "lucide-react";
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
  onRefreshPool
}) => {
  const [dailyAttemptUsed, setDailyAttemptUsed] = useState(() => {
    // Check if user has used their daily attempt today
    const lastAttemptDate = localStorage.getItem(`mysteryBall_dailyAttempt_${studentId}`);
    const today = new Date().toDateString();
    return lastAttemptDate === today;
  });
  
  console.log("MysteryBallTab render with props:", {
    studentId,
    schoolId,
    coinsAvailable: coins,
    pokemonsAvailable: schoolPokemons.length
  });
  
  return <Card className="mx-auto max-w-xl shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-md">
        <CardTitle className="text-2xl">Mystery Pokémon Ball</CardTitle>
        <CardDescription className="text-white opacity-90">2 coins per try, first attempt is free daily</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {schoolPokemons.length === 0 ? <div className="text-center p-8">
            <p className="mb-4 text-lg text-gray-700">No available Pokémon</p>
            <Button onClick={onRefreshPool} className="mx-auto flex items-center gap-2" disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              {isLoading ? "Checking..." : "Check Availability"}
            </Button>
          </div> : <div className="flex flex-col items-center">
            <MysteryBall 
              studentId={studentId} 
              schoolId={schoolId} 
              coins={coins} 
              schoolPokemons={schoolPokemons} 
              onPokemonWon={onPokemonWon} 
              onCoinsWon={onCoinsWon} 
              dailyAttemptUsed={dailyAttemptUsed} 
              setDailyAttemptUsed={setDailyAttemptUsed} 
            />
            
            <div className="mt-6 text-center">
              <p className="mb-2 text-sm font-medium">Mystery ball contains:</p>
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                <div className="flex items-center gap-1 bg-purple-100 rounded-full px-3 py-1">
                  <Dice6 className="h-4 w-4 text-purple-500" />
                  <span className="text-xs">Random Pokémon</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-100 rounded-full px-3 py-1">
                  <Package className="h-4 w-4 text-amber-500" />
                  <span className="text-xs">Bonus Coins (1-5)</span>
                </div>
                <div className="flex items-center gap-1 bg-red-100 rounded-full px-3 py-1">
                  <X className="h-4 w-4 text-red-500" />
                  <span className="text-xs">Nothing Found!</span>
                </div>
              </div>
            </div>
          </div>}
      </CardContent>
    </Card>;
};
export default MysteryBallTab;
