
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pokemon } from "@/types/pokemon";
import { RefreshCw, Coins, Sparkle } from "lucide-react";
import { 
  getSchoolPokemonPool, 
  assignPokemonToStudent, 
  useStudentCoin 
} from "@/utils/pokemon";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

const MAX_WHEEL_POKEMON = 12;

interface PokemonWheelProps {
  studentId: string;
  classId: string;
  coins: number;
  onPokemonWon: (pokemon: Pokemon) => void;
}

const PokemonWheel: React.FC<PokemonWheelProps> = ({
  studentId,
  classId,
  coins,
  onPokemonWon
}) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [wheelPokemon, setWheelPokemon] = useState<Pokemon[]>([]);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [wonPokemon, setWonPokemon] = useState<Pokemon | null>(null);

  // Load wheel Pokémon from school pool
  useEffect(() => {
    loadWheelPokemon();
  }, [classId, studentId]);

  // Function to load random Pokémon for the wheel
  const loadWheelPokemon = () => {
    if (!classId) return;
    
    const schoolPool = getSchoolPokemonPool(classId);
    if (!schoolPool || schoolPool.availablePokemons.length === 0) {
      setWheelPokemon([]);
      return;
    }
    
    // Get random Pokémon from the school pool
    const availablePokemon = [...schoolPool.availablePokemons];
    const wheelSelection = [];
    
    // Select up to MAX_WHEEL_POKEMON random Pokémon
    const selectionCount = Math.min(MAX_WHEEL_POKEMON, availablePokemon.length);
    for (let i = 0; i < selectionCount; i++) {
      const randomIndex = Math.floor(Math.random() * availablePokemon.length);
      wheelSelection.push(availablePokemon.splice(randomIndex, 1)[0]);
    }
    
    setWheelPokemon(wheelSelection);
  };

  // Handle spinning the wheel
  const handleSpin = () => {
    if (isSpinning || wheelPokemon.length === 0) return;
    if (coins < 1) {
      toast({
        title: t("not-enough-coins"),
        description: t("need-coins-to-spin"),
      });
      return;
    }
    
    // Use a coin to spin
    const success = useStudentCoin(studentId);
    if (!success) {
      toast({
        title: t("error"),
        description: t("failed-to-use-coin"),
      });
      return;
    }
    
    setIsSpinning(true);
    setShowWinAnimation(false);
    setWonPokemon(null);
    
    // Randomly select a Pokémon
    const winnerIndex = Math.floor(Math.random() * wheelPokemon.length);
    
    // Calculate rotation to land on the winner
    const segmentDegree = 360 / wheelPokemon.length;
    const baseRotation = 1800; // Multiple spins for effect
    const winnerRotation = winnerIndex * segmentDegree;
    const targetRotation = baseRotation + winnerRotation;
    
    setRotationDegree(targetRotation);
    setSelectedPokemonIndex(winnerIndex);
    
    // Wait for spin animation to complete
    setTimeout(() => {
      setIsSpinning(false);
      
      // Assign the Pokémon to the student
      const pokemon = wheelPokemon[winnerIndex];
      const assignSuccess = assignPokemonToStudent(classId, studentId, pokemon.id);
      
      if (assignSuccess) {
        // Show win animation
        setWonPokemon(pokemon);
        setShowWinAnimation(true);
        
        // Remove won Pokémon from wheel
        const updatedWheelPokemon = wheelPokemon.filter(p => p.id !== pokemon.id);
        setWheelPokemon(updatedWheelPokemon);
        
        // Notify parent component
        onPokemonWon(pokemon);
        
        toast({
          title: t("congratulations"),
          description: t("you-won-pokemon").replace("{name}", pokemon.name),
        });
      } else {
        toast({
          title: t("error"),
          description: t("failed-to-claim-pokemon"),
        });
      }
    }, 3000);
  };

  // Refresh the wheel with new Pokémon
  const handleRefreshWheel = () => {
    if (coins < 1) {
      toast({
        title: t("error"),
        description: t("need-coins-to-refresh"),
      });
      return;
    }
    
    // Use a coin to refresh
    const success = useStudentCoin(studentId);
    if (!success) {
      toast({
        title: t("error"),
        description: t("failed-to-use-coin"),
      });
      return;
    }
    
    // Load new Pokémon
    loadWheelPokemon();
    
    // Notify parent to update coin display
    onPokemonWon({} as Pokemon);
    
    toast({
      title: t("wheel-refreshed"),
      description: t("new-pokemon-available"),
    });
  };
  
  // Close the win modal
  const closeWinModal = () => {
    setShowWinAnimation(false);
  };

  // Calculate wheel segment degree
  const segmentDegree = wheelPokemon.length > 0 ? 360 / wheelPokemon.length : 30;
  
  // Show empty state when no Pokémon are available
  if (wheelPokemon.length === 0) {
    return (
      <Card className="pokemon-card">
        <CardContent className="pt-6 text-center p-8">
          <p>{t("no-available-pokemon")}</p>
          <Button
            onClick={loadWheelPokemon}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("check-availability")}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      {/* Pokemon Win Modal */}
      {showWinAnimation && wonPokemon && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 animate-fade-in">
          <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl max-w-md w-full animate-scale-in">
            <div className="relative p-6 text-center">
              <h2 className="text-2xl font-bold mb-3">{t("congratulations")}</h2>
              <p className="text-lg mb-6">{t("you-won-pokemon").replace("{name}", wonPokemon.name)}</p>
              
              <div className="relative mb-6">
                <Sparkle className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-yellow-400 h-6 w-6 animate-pulse" />
                <Sparkle className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-yellow-400 h-8 w-8 animate-pulse" />
                
                <div className="mx-auto w-32 h-32 bg-white rounded-full p-2 border-4 border-white shadow-xl flex items-center justify-center">
                  <img 
                    src={wonPokemon.image} 
                    alt={wonPokemon.name} 
                    className="w-full h-full object-contain animate-bounce"
                  />
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-50 mb-4">
                <p className="mb-2">
                  <span className="font-medium">
                    {t("pokemon-type").replace("{type}", wonPokemon.type)}
                  </span>
                </p>
                <p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${
                    wonPokemon.rarity === 'legendary' ? 'bg-yellow-500' :
                    wonPokemon.rarity === 'rare' ? 'bg-purple-500' :
                    wonPokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {wonPokemon.rarity}
                  </span>
                </p>
              </div>
              
              <Button 
                className="w-full"
                onClick={closeWinModal}
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Wheel Animation */}
      <div className="relative w-80 h-80 mb-6">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 bg-red-500 rotate-45 transform origin-bottom shadow-lg"></div>
        </div>
        
        {/* Wheel background */}
        <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner"></div>
        
        {/* Wheel */}
        <div 
          className="w-full h-full rounded-full relative overflow-hidden shadow-xl border-8 border-gray-700"
          style={{ 
            transform: `rotate(${rotationDegree}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)' : 'none'
          }}
        >
          {wheelPokemon.map((pokemon, index) => {
            const startAngle = index * segmentDegree;
            const endAngle = (index + 1) * segmentDegree;
            
            // Determine colors based on rarity
            const bgColor = pokemon.rarity === 'legendary' ? 'bg-yellow-500' :
                           pokemon.rarity === 'rare' ? 'bg-purple-500' :
                           pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500';
            
            const borderColor = pokemon.rarity === 'legendary' ? 'border-yellow-600' :
                               pokemon.rarity === 'rare' ? 'border-purple-600' :
                               pokemon.rarity === 'uncommon' ? 'border-blue-600' : 'border-green-600';
            
            return (
              <div 
                key={pokemon.id}
                className={`absolute w-full h-full ${bgColor} ${borderColor}`}
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(endAngle * Math.PI / 180)}%)`
                }}
              >
                <div 
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{ transform: `rotate(${startAngle + segmentDegree / 2}deg)` }}
                >
                  <div 
                    className={`w-16 h-16 bg-white rounded-full overflow-hidden relative shadow-lg border-2 ${borderColor}`}
                    style={{ transform: `translateX(120px) rotate(${-startAngle - segmentDegree / 2}deg)` }}
                  >
                    <img 
                      src={pokemon.image} 
                      alt={pokemon.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex flex-col items-center gap-2">
        <Button
          className="pokemon-button text-lg px-8 py-6"
          disabled={isSpinning || coins <= 0}
          onClick={handleSpin}
          size="lg"
        >
          {isSpinning ? t("spinning") : `${t("spin-wheel")} (1 ${t("coin")})`}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleRefreshWheel}
          disabled={coins < 1 || isSpinning}
          className="mt-2"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("refresh-wheel")} (1 {t("coin")})
        </Button>
        
        <p className="mt-4 text-lg font-medium">{t("you-have")} {coins} {t("coins")}</p>
        
        {selectedPokemonIndex !== null && !isSpinning && !showWinAnimation && wheelPokemon[selectedPokemonIndex] && (
          <div className="mt-2 animate-fade-in">
            <p>{t("last-spin")}: <span className="font-bold">{wheelPokemon[selectedPokemonIndex].name}</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonWheel;
