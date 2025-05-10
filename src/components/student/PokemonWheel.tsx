
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Pokemon } from "@/types/pokemon";
import { useStudentCoin, assignPokemonToStudent, getSchoolPokemonPool, removeCoinsFromStudent } from "@/utils/pokemonData";
import { useTranslation } from "@/hooks/useTranslation";
import { Sparkle, Star, RefreshCw } from "lucide-react";

interface PokemonWheelProps {
  studentId: string;
  classId: string;
  pokemonPool: Pokemon[];
  coins: number;
  onPokemonWon: (pokemon: Pokemon) => void;
}

const PokemonWheel: React.FC<PokemonWheelProps> = ({ 
  studentId, 
  classId,
  pokemonPool, 
  coins,
  onPokemonWon
}) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [visiblePokemon, setVisiblePokemon] = useState<Pokemon[]>([]);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [wonPokemon, setWonPokemon] = useState<Pokemon | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [canRefresh, setCanRefresh] = useState(true);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Maximum number of Pokemon displayed in the wheel
  const MAX_WHEEL_POKEMON = 12;
  
  // Helper function to get a random subset of Pokemon
  const getRandomPokemonSubset = (pool: Pokemon[], count: number) => {
    if (pool.length <= count) {
      return [...pool];
    }
    
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  // Check if a refresh is allowed (once per day)
  const checkRefreshAllowed = () => {
    const lastRefreshDate = localStorage.getItem(`wheelRefresh_${studentId}`);
    
    if (!lastRefreshDate) {
      setCanRefresh(true);
      return;
    }
    
    const lastDate = new Date(lastRefreshDate);
    const currentDate = new Date();
    
    // Check if it's a new day
    const isSameDay = lastDate.getDate() === currentDate.getDate() && 
                      lastDate.getMonth() === currentDate.getMonth() && 
                      lastDate.getFullYear() === currentDate.getFullYear();
    
    setCanRefresh(!isSameDay);
    setLastRefreshed(lastRefreshDate);
  };
  
  // Load Pokemon wheel data
  useEffect(() => {
    const refreshPoolData = () => {
      if (classId) {
        const schoolPool = getSchoolPokemonPool(classId);
        if (schoolPool && schoolPool.availablePokemons.length > 0) {
          // Get stored wheel Pokemon for this student or create new random selection
          const storedWheelPokemon = localStorage.getItem(`wheelPokemon_${studentId}`);
          
          if (storedWheelPokemon) {
            try {
              const parsedPokemon = JSON.parse(storedWheelPokemon);
              // Validate that these Pokemon still exist in the pool
              const validPokemon = parsedPokemon.filter((p: Pokemon) => 
                schoolPool.availablePokemons.some(sp => sp.id === p.id)
              );
              
              if (validPokemon.length > 0) {
                setVisiblePokemon(validPokemon);
              } else {
                // If none are valid anymore, get new random selection
                const randomSubset = getRandomPokemonSubset(schoolPool.availablePokemons, MAX_WHEEL_POKEMON);
                setVisiblePokemon(randomSubset);
                localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(randomSubset));
              }
            } catch (error) {
              console.error("Error parsing stored wheel Pokemon:", error);
              const randomSubset = getRandomPokemonSubset(schoolPool.availablePokemons, MAX_WHEEL_POKEMON);
              setVisiblePokemon(randomSubset);
              localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(randomSubset));
            }
          } else {
            // No stored wheel Pokemon, create new random selection
            const randomSubset = getRandomPokemonSubset(schoolPool.availablePokemons, MAX_WHEEL_POKEMON);
            setVisiblePokemon(randomSubset);
            localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(randomSubset));
          }
        } else {
          setVisiblePokemon([]);
        }
      }
    };

    // Initial load
    refreshPoolData();
    checkRefreshAllowed();
  }, [studentId, classId, pokemonPool]);
  
  // Calculate wheel segment degree
  const wheelSegmentDegree = visiblePokemon.length > 0 ? 360 / visiblePokemon.length : 30;
  
  // Handle spinning the wheel
  const handleSpin = () => {
    if (coins <= 0) {
      toast({
        title: t("error"),
        description: t("not-enough-coins")
      });
      return;
    }
    
    if (isSpinning || visiblePokemon.length === 0) {
      return;
    }
    
    // Use a coin
    const success = useStudentCoin(studentId);
    if (!success) {
      toast({
        title: t("error"),
        description: t("not-enough-coins")
      });
      return;
    }
    
    setIsSpinning(true);
    setShowWinAnimation(false);
    setWonPokemon(null);
    
    // Randomly determine winner
    const winnerIndex = Math.floor(Math.random() * visiblePokemon.length);
    
    // Calculate rotation to land on winner
    const baseRotation = 3600; // Spin multiple times for effect
    const winnerPositionDegree = 270; // Top position
    const winnerRotation = winnerPositionDegree - (winnerIndex * wheelSegmentDegree);
    
    const targetRotation = baseRotation + winnerRotation;
    
    setRotationDegree(targetRotation);
    setSelectedPokemonIndex(winnerIndex);
    
    // Wait for spin animation to complete
    setTimeout(() => {
      setIsSpinning(false);
      
      // Assign the pokemon to the student
      if (winnerIndex >= 0 && winnerIndex < visiblePokemon.length) {
        const wonPokemon = visiblePokemon[winnerIndex];
        
        // Assign Pokemon to student (which will remove it from the school pool)
        const success = assignPokemonToStudent(classId, studentId, wonPokemon.id);
        
        if (success) {
          setWonPokemon(wonPokemon);
          setShowWinAnimation(true);
          
          // Wait a moment before showing the toast to let the animation start
          setTimeout(() => {
            toast({
              title: t("congratulations"),
              description: t("you-won-pokemon").replace("{name}", wonPokemon.name)
            });
          }, 500);
          
          // Remove the won pokemon from the visible pokemon list
          const updatedVisiblePokemon = visiblePokemon.filter(p => p.id !== wonPokemon.id);
          
          // If the wheel is now empty, get new pokemon
          if (updatedVisiblePokemon.length === 0) {
            // Get fresh pool data
            const schoolPool = getSchoolPokemonPool(classId);
            if (schoolPool && schoolPool.availablePokemons.length > 0) {
              const randomSubset = getRandomPokemonSubset(schoolPool.availablePokemons, MAX_WHEEL_POKEMON);
              setVisiblePokemon(randomSubset);
              localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(randomSubset));
            } else {
              setVisiblePokemon([]);
            }
          } else {
            setVisiblePokemon(updatedVisiblePokemon);
            localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(updatedVisiblePokemon));
          }
          
          onPokemonWon(wonPokemon);
        } else {
          toast({
            title: t("error"),
            description: "Failed to claim Pokémon."
          });
        }
      }
    }, 3000);
  };
  
  // Handle refreshing the wheel
  const handleRefreshWheel = () => {
    // Check if refreshing is allowed
    if (!canRefresh) {
      toast({
        title: t("error"),
        description: t("daily-refresh-limit")
      });
      return;
    }
    
    // Use a coin for refreshing
    if (coins < 1) {
      toast({
        title: t("error"),
        description: t("not-enough-coins")
      });
      return;
    }
    
    // Remove a coin
    const coinRemoved = removeCoinsFromStudent(studentId, 1);
    if (!coinRemoved) {
      toast({
        title: t("error"),
        description: t("not-enough-coins")
      });
      return;
    }
    
    // Get fresh pokemon from the pool
    const schoolPool = getSchoolPokemonPool(classId);
    if (schoolPool && schoolPool.availablePokemons.length > 0) {
      const randomSubset = getRandomPokemonSubset(schoolPool.availablePokemons, MAX_WHEEL_POKEMON);
      setVisiblePokemon(randomSubset);
      
      // Store the new selection and refresh timestamp
      localStorage.setItem(`wheelPokemon_${studentId}`, JSON.stringify(randomSubset));
      const now = new Date().toISOString();
      localStorage.setItem(`wheelRefresh_${studentId}`, now);
      
      setLastRefreshed(now);
      setCanRefresh(false);
      
      // Update UI
      toast({
        title: t("wheel-refreshed"),
        description: t("new-pokemon-available")
      });
      
      // Trigger the parent to update coins display
      onPokemonWon({} as Pokemon);
    } else {
      toast({
        title: t("error"),
        description: t("no-pokemon-in-pool")
      });
    }
  };
  
  // Reset rotation after spinning for animation purposes
  useEffect(() => {
    if (!isSpinning) {
      setTimeout(() => {
        setRotationDegree(0);
      }, 500);
    }
  }, [isSpinning]);
  
  // Get rarity-based styling
  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          background: 'bg-yellow-500',
          border: 'border-yellow-600',
          glow: 'shadow-yellow-300',
          text: 'text-yellow-700',
          gradient: 'from-yellow-300 to-yellow-600'
        };
      case 'rare':
        return {
          background: 'bg-purple-500',
          border: 'border-purple-600',
          glow: 'shadow-purple-300',
          text: 'text-purple-700',
          gradient: 'from-purple-300 to-purple-600'
        };
      case 'uncommon':
        return {
          background: 'bg-blue-500',
          border: 'border-blue-600',
          glow: 'shadow-blue-300',
          text: 'text-blue-700',
          gradient: 'from-blue-300 to-blue-600'
        };
      default:
        return {
          background: 'bg-green-500',
          border: 'border-green-600',
          glow: 'shadow-green-300',
          text: 'text-green-700',
          gradient: 'from-green-300 to-green-600'
        };
    }
  };
  
  // Show message when no Pokemon are available
  if (visiblePokemon.length === 0) {
    return (
      <Card className="pokemon-card">
        <CardContent className="pt-6 text-center p-8">
          <p>{t("no-available-pokemon")}</p>
          {canRefresh && (
            <Button
              onClick={handleRefreshWheel}
              className="mt-4"
              disabled={coins < 1}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("refresh-wheel")} (1 {t("coin")})
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      {/* The Pokemon Win Animation/Modal */}
      {showWinAnimation && wonPokemon && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 animate-fade-in">
          <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl max-w-md w-full animate-scale-in">
            <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${getRarityStyles(wonPokemon.rarity).gradient}`}></div>
            
            <div className="relative p-6 text-center">
              <h2 className="text-2xl font-bold mb-3">{t("congratulations")}</h2>
              <p className="text-lg mb-6">{t("you-won-pokemon").replace("{name}", wonPokemon.name)}</p>
              
              <div className="relative mb-6">
                {/* Sparkle animations around the Pokemon */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 animate-pulse">
                  <Sparkle className="text-yellow-400 h-6 w-6" />
                </div>
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "0.5s" }}>
                  <Sparkle className="text-yellow-400 h-8 w-8" />
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: "1s" }}>
                  <Sparkle className="text-yellow-400 h-7 w-7" />
                </div>
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "0.7s" }}>
                  <Star className="text-yellow-400 h-5 w-5" />
                </div>
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "1.2s" }}>
                  <Star className="text-yellow-400 h-5 w-5" />
                </div>
                
                <div className="mx-auto w-32 h-32 bg-white rounded-full p-2 border-4 border-white shadow-xl flex items-center justify-center">
                  <img 
                    src={wonPokemon.image} 
                    alt={wonPokemon.name} 
                    className="w-full h-full object-contain animate-bounce"
                    style={{ animationDuration: "2s" }}
                  />
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-50 mb-4">
                <p className="mb-2">
                  <span className={`font-medium ${getRarityStyles(wonPokemon.rarity).text}`}>
                    {t("pokemon-type").replace("{type}", wonPokemon.type)}
                  </span>
                </p>
                <p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${getRarityStyles(wonPokemon.rarity).background}`}>
                    {t("pokemon-rarity").replace("{rarity}", wonPokemon.rarity)}
                  </span>
                </p>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">{t("pokemon-added")}</p>
              
              <Button 
                className="pokemon-button w-full"
                onClick={() => setShowWinAnimation(false)}
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-80 h-80 mb-6">
        {/* Wheel pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 bg-red-500 rotate-45 transform origin-bottom shadow-lg"></div>
        </div>
        
        {/* Wheel background */}
        <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner"></div>
        
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full relative overflow-hidden spin-wheel shadow-xl border-8 border-gray-700"
          style={{ 
            transform: `rotate(${rotationDegree}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)' : 'none'
          }}
        >
          {visiblePokemon.map((pokemon, index) => {
            const startAngle = index * wheelSegmentDegree;
            const endAngle = (index + 1) * wheelSegmentDegree;
            const rarityStyle = getRarityStyles(pokemon.rarity);
            
            return (
              <div 
                key={pokemon.id}
                className={`absolute w-full h-full ${rarityStyle.background} ${rarityStyle.border}`}
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(endAngle * Math.PI / 180)}%)`
                }}
              >
                <div 
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{ transform: `rotate(${startAngle + wheelSegmentDegree / 2}deg)` }}
                >
                  <div 
                    className={`w-16 h-16 bg-white rounded-full overflow-hidden relative ${rarityStyle.glow} shadow-lg border-2 ${rarityStyle.border}`}
                    style={{ transform: `translateX(120px) rotate(${-startAngle - wheelSegmentDegree / 2}deg)` }}
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
      
      <div className="flex flex-col items-center gap-2">
        <Button
          className="pokemon-button text-lg px-8 py-6"
          disabled={isSpinning || coins <= 0}
          onClick={handleSpin}
          size="lg"
        >
          {isSpinning ? t("spinning") : `${t("spin-wheel")} (1 ${t("coin")})`}
        </Button>
        
        {canRefresh && (
          <Button
            variant="outline"
            onClick={handleRefreshWheel}
            disabled={coins < 1 || isSpinning}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh-wheel")} (1 {t("coin")})
          </Button>
        )}
        
        <p className="mt-4 text-lg font-medium">{t("you-have")} {coins} {t("coins")}</p>
        
        {selectedPokemonIndex !== null && !isSpinning && !showWinAnimation && (
          <div className="mt-2 animate-fade-in">
            <p>{t("last-spin")}: <span className="font-bold">{visiblePokemon[selectedPokemonIndex]?.name}</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonWheel;
