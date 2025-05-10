
import React from "react";

const PokemonDecorations: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none">
      {/* Pokemon silhouettes */}
      <div className="flex justify-around items-end">
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png" 
          alt="Snorlax" 
          className="h-32 w-auto filter brightness-0 opacity-40 transform scale-x-[-1]" 
        />
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" 
          alt="Charizard" 
          className="h-40 w-auto filter brightness-0 opacity-40" 
        />
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png" 
          alt="Blastoise" 
          className="h-36 w-auto filter brightness-0 opacity-40" 
        />
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png" 
          alt="Venusaur" 
          className="h-32 w-auto filter brightness-0 opacity-40 transform scale-x-[-1]" 
        />
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png" 
          alt="Dragonite" 
          className="h-44 w-auto filter brightness-0 opacity-40" 
        />
      </div>
      
      {/* Gradient overlay for better blending */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
};

export default PokemonDecorations;
