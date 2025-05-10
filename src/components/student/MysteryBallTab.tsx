
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package, Gift, X, Dice6 } from "lucide-react";
import { Pokemon } from "@/types/pokemon";
import MysteryBall from "@/components/student/MysteryBall";
import { useIsMobile } from "@/hooks/use-mobile";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useStudentCoin, assignRandomPokemonToStudent } from "@/utils/pokemon";
import MysteryBallResult from "./MysteryBallResult";

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
  
  const [multipleCount, setMultipleCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    type: "pokemon" | "coins" | "nothing";
    data?: Pokemon | number;
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [wonPokemon, setWonPokemon] = useState<Pokemon | null>(null);
  const [wonCoins, setWonCoins] = useState(0);
  
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const getMaxPossibleOpens = () => {
    if (!dailyAttemptUsed) {
      // If they haven't used their free daily attempt, they can open 1 + (coins ÷ 2)
      return Math.min(10, 1 + Math.floor(coins / 2));
    } else {
      // If they have used their free daily attempt, they can open (coins ÷ 2)
      return Math.min(10, Math.floor(coins / 2));
    }
  };
  
  const handleOpenMultiple = async () => {
    if (isProcessing) return;
    
    const maxPossible = getMaxPossibleOpens();
    const actualCount = Math.min(multipleCount, maxPossible);
    
    if (actualCount <= 0) {
      toast({
        title: "Not Enough Coins",
        description: "You don't have enough coins to open any mystery balls.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    let pokemonWon = 0;
    let coinsWon = 0;
    let nothingWon = 0;
    let remainingOpens = actualCount;
    let usedFreeAttempt = false;
    
    const results = [];
    
    // Process each open sequentially
    for (let i = 0; i < actualCount; i++) {
      // Check if this is the free attempt
      const isFreeAttempt = !dailyAttemptUsed && !usedFreeAttempt;
      
      // If not free attempt, use coins
      if (!isFreeAttempt) {
        const success = useStudentCoin(studentId, 2);
        if (!success) {
          toast({
            title: "Error",
            description: "Failed to use coins. Please try again.",
            variant: "destructive"
          });
          break;
        }
      } else {
        // Mark free attempt as used
        usedFreeAttempt = true;
        setDailyAttemptUsed(true);
        localStorage.setItem(`mysteryBall_dailyAttempt_${studentId}`, new Date().toDateString());
      }
      
      // Determine result (60% chance for Pokémon, 30% for coins, 10% for nothing)
      const random = Math.random();
      
      if (random < 0.6 && schoolPokemons.length > 0) {
        // Get a random Pokémon
        const randomIndex = Math.floor(Math.random() * schoolPokemons.length);
        const pokemon = schoolPokemons[randomIndex];
        
        // Assign Pokémon to student
        const success = assignRandomPokemonToStudent(schoolId, studentId, pokemon.id);
        
        if (success) {
          pokemonWon++;
          results.push({ type: "pokemon", pokemon });
          
          // Save the last Pokemon for display
          setWonPokemon(pokemon);
          setCurrentResult({ type: "pokemon", data: pokemon });
          
          // Call the callback
          onPokemonWon(pokemon);
        } else {
          // Fallback to coins
          const coinAmount = Math.floor(Math.random() * 5) + 1;
          coinsWon += coinAmount;
          results.push({ type: "coins", amount: coinAmount });
          
          // Call the callback
          onCoinsWon(coinAmount);
        }
      } else if (random < 0.9) {
        // Award coins
        const coinAmount = Math.floor(Math.random() * 5) + 1;
        coinsWon += coinAmount;
        results.push({ type: "coins", amount: coinAmount });
        
        // Save for display
        setWonCoins(coinAmount);
        setCurrentResult({ type: "coins", data: coinAmount });
        
        // Call the callback
        onCoinsWon(coinAmount);
      } else {
        // Nothing
        nothingWon++;
        results.push({ type: "nothing" });
        setCurrentResult({ type: "nothing" });
      }
      
      remainingOpens--;
      
      // Wait briefly between opens
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Show summary toast
    toast({
      title: "Opening Complete",
      description: `Results: ${pokemonWon} Pokémon, ${coinsWon} coins, ${nothingWon} empty balls`,
    });
    
    // Display the last result in the modal
    if (results.length > 0) {
      const lastResult = results[results.length - 1];
      setShowResult(true);
    }
    
    setIsProcessing(false);
  };
  
  const handleCloseResult = () => {
    setShowResult(false);
    setCurrentResult(null);
  };
  
  console.log("MysteryBallTab render with props:", {
    studentId,
    schoolId,
    coinsAvailable: coins,
    pokemonsAvailable: schoolPokemons.length
  });
  
  return (
    <Card className="mx-auto max-w-xl shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-md">
        <CardTitle className="text-2xl">Mystery Pokémon Ball</CardTitle>
        <CardDescription className="text-white opacity-90">2 coins per try, first attempt is free daily</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {schoolPokemons.length === 0 ? (
          <div className="text-center p-8">
            <p className="mb-4 text-lg text-gray-700">No available Pokémon</p>
            <Button onClick={onRefreshPool} className="mx-auto flex items-center gap-2" disabled={isLoading}>
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
            />
            
            {!isMobile && (
              <div className="w-full mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-3 text-center">Open Multiple Balls</h3>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full flex items-center gap-4">
                    <span className="text-sm font-medium">Count:</span>
                    <Slider
                      value={[multipleCount]}
                      min={1}
                      max={getMaxPossibleOpens()}
                      step={1}
                      onValueChange={(value) => setMultipleCount(value[0])}
                      className="flex-1"
                      disabled={isProcessing}
                    />
                    <span className="text-sm font-medium w-6 text-center">{multipleCount}</span>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Cost: {multipleCount > 0 && !dailyAttemptUsed ? (multipleCount - 1) * 2 : multipleCount * 2} coins
                  </p>
                  
                  <Button 
                    onClick={handleOpenMultiple} 
                    disabled={isProcessing || (coins < 2 && dailyAttemptUsed)} 
                    className="w-full"
                  >
                    {isProcessing ? "Opening..." : `Open ${multipleCount} Balls`}
                  </Button>
                </div>
              </div>
            )}
            
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
            
            {/* Result Modal for multiple opens */}
            <MysteryBallResult
              isOpen={showResult}
              onClose={handleCloseResult}
              result={currentResult || { type: "nothing" }}
              pokemon={wonPokemon}
              coins={wonCoins}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MysteryBallTab;
