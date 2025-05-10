
import React from "react";
import { Pokemon } from "@/types/pokemon";
import { getRarityStyles } from "./pokemonWheelUtils";

interface PokemonWheelAnimationProps {
  visiblePokemon: Pokemon[];
  rotationDegree: number;
  isSpinning: boolean;
  wheelSegmentDegree: number;
}

const PokemonWheelAnimation: React.FC<PokemonWheelAnimationProps> = ({
  visiblePokemon,
  rotationDegree,
  isSpinning,
  wheelSegmentDegree
}) => {
  return (
    <div className="relative w-80 h-80 mb-6">
      {/* Wheel pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-8 h-8 bg-red-500 rotate-45 transform origin-bottom shadow-lg"></div>
      </div>
      
      {/* Wheel background */}
      <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner"></div>
      
      {/* Wheel */}
      <div 
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
  );
};

export default PokemonWheelAnimation;
