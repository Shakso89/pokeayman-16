
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
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const wheelSegmentDegree = 360 / pokemonPool.length;
  
  const handleSpin = () => {
    if (coins <= 0) {
      toast({
        title: "Error",
        description: "You don't have enough coins!",
        variant: "destructive"
      });
      return;
    }
    
    if (isSpinning || pokemonPool.length === 0) {
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
    const winnerIndex = Math.floor(Math.random() * pokemonPool.length);
    
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
      if (winnerIndex >= 0 && winnerIndex < pokemonPool.length) {
        const wonPokemon = pokemonPool[winnerIndex];
        const success = assignPokemonToStudent(classId, studentId, wonPokemon.id);
        
        if (success) {
          toast({
            title: "Congratulations!",
            description: `You won a ${wonPokemon.name}!`
          });
          onPokemonWon(wonPokemon);
        } else {
          toast({
            title: "Error",
            description: "Failed to claim Pokémon.",
            variant: "destructive"
          });
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
      <div className="relative w-64 h-64 mb-6">
        {/* Wheel pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-6 h-6 bg-red-500 rotate-45 transform origin-bottom"></div>
        </div>
        
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full relative overflow-hidden spin-wheel"
          style={{ 
            transform: `rotate(${rotationDegree}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)' : 'none'
          }}
        >
          {pokemonPool.map((pokemon, index) => {
            const startAngle = index * wheelSegmentDegree;
            const endAngle = (index + 1) * wheelSegmentDegree;
            
            const backgroundColor = 
              pokemon.rarity === 'legendary' ? 'bg-yellow-500' :
              pokemon.rarity === 'rare' ? 'bg-purple-500' :
              pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500';
            
            return (
              <div 
                key={pokemon.id}
                className={`absolute w-full h-full ${backgroundColor}`}
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(endAngle * Math.PI / 180)}%)`
                }}
              >
                <div 
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{ transform: `rotate(${startAngle + wheelSegmentDegree / 2}deg)` }}
                >
                  <div 
                    className="w-12 h-12 bg-white rounded-full overflow-hidden relative"
                    style={{ transform: `translateX(100px) rotate(${-startAngle - wheelSegmentDegree / 2}deg)` }}
                  >
                    <img 
                      src={pokemon.image} 
                      alt={pokemon.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <Button
        className="pokemon-button"
        disabled={isSpinning || coins <= 0}
        onClick={handleSpin}
      >
        {isSpinning ? 'Spinning...' : `Spin (1 coin)`}
      </Button>
      <p className="mt-2">You have {coins} coin(s)</p>
    </div>
  );
};

export default PokemonWheel;
