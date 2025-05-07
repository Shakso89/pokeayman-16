
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Pokemon } from "@/types/pokemon";
import { useStudentCoin, assignPokemonToStudent } from "@/utils/pokemonData";

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
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [visiblePokemon, setVisiblePokemon] = useState<Pokemon[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Limit the number of Pokemon displayed in the wheel for better UX
  const MAX_WHEEL_POKEMON = 12;
  
  useEffect(() => {
    // Randomly select a subset of Pokemon for the wheel if there are more than MAX_WHEEL_POKEMON
    if (pokemonPool.length > MAX_WHEEL_POKEMON) {
      const shuffled = [...pokemonPool].sort(() => 0.5 - Math.random());
      setVisiblePokemon(shuffled.slice(0, MAX_WHEEL_POKEMON));
    } else {
      setVisiblePokemon(pokemonPool);
    }
  }, [pokemonPool]);
  
  const wheelSegmentDegree = 360 / visiblePokemon.length;
  
  const handleSpin = () => {
    if (coins <= 0) {
      toast({
        title: "Error",
        description: "You don't have enough coins!",
        variant: "destructive"
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
        title: "Error",
        description: "Failed to use coin.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSpinning(true);
    
    // Randomly determine winner
    const winnerIndex = Math.floor(Math.random() * visiblePokemon.length);
    
    // Calculate rotation to land on winner
    // The wheel spins clockwise, so we need to calculate the rotation
    // to make the winner at the top position (270 degrees)
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
        
        // Find the actual Pokemon in the pool (not just the visible subset)
        const actualPokemon = pokemonPool.find(p => p.id === wonPokemon.id);
        
        if (actualPokemon) {
          const success = assignPokemonToStudent(classId, studentId, actualPokemon.id);
          
          if (success) {
            toast({
              title: "Congratulations!",
              description: `You won a ${actualPokemon.name}!`,
              variant: "default"
            });
            onPokemonWon(actualPokemon);
          } else {
            toast({
              title: "Error",
              description: "Failed to claim Pokémon.",
              variant: "destructive"
            });
          }
        }
      }
    }, 3000);
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
          glow: 'shadow-yellow-300'
        };
      case 'rare':
        return {
          background: 'bg-purple-500',
          border: 'border-purple-600',
          glow: 'shadow-purple-300'
        };
      case 'uncommon':
        return {
          background: 'bg-blue-500',
          border: 'border-blue-600',
          glow: 'shadow-blue-300'
        };
      default:
        return {
          background: 'bg-green-500',
          border: 'border-green-600',
          glow: 'shadow-green-300'
        };
    }
  };
  
  if (pokemonPool.length === 0) {
    return (
      <Card className="pokemon-card">
        <CardContent className="pt-6 text-center p-8">
          <p>No Pokémon available in the wheel.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
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
      
      <Button
        className="pokemon-button text-lg px-8 py-6"
        disabled={isSpinning || coins <= 0}
        onClick={handleSpin}
        size="lg"
      >
        {isSpinning ? 'Spinning...' : `Spin (1 coin)`}
      </Button>
      <p className="mt-4 text-lg font-medium">You have {coins} coin(s)</p>
      
      {selectedPokemonIndex !== null && !isSpinning && (
        <div className="mt-4 animate-fade-in">
          <p>Last spin: <span className="font-bold">{visiblePokemon[selectedPokemonIndex]?.name}</span></p>
        </div>
      )}
    </div>
  );
};

export default PokemonWheel;
