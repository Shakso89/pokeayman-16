
import React from "react";
import { Pokemon } from "@/types/pokemon";

interface PokemonWheelAnimationProps {
  pokemons: Pokemon[];
  rotationDegree: number;
  isSpinning: boolean;
}

const PokemonWheelAnimation: React.FC<PokemonWheelAnimationProps> = ({
  pokemons,
  rotationDegree,
  isSpinning
}) => {
  // Calculate wheel segment degree
  const segmentDegree = pokemons.length > 0 ? 360 / pokemons.length : 30;
  
  return (
    <div className="relative w-72 h-72 mb-8">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-6 h-6 bg-red-500 rotate-45 transform origin-bottom shadow-lg"></div>
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
        {pokemons.map((pokemon, index) => {
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
                  className={`w-12 h-12 bg-white rounded-full overflow-hidden relative shadow-lg border-2 ${borderColor}`}
                  style={{ transform: `translateX(100px) rotate(${-startAngle - segmentDegree / 2}deg)` }}
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
  );
};

export default PokemonWheelAnimation;
