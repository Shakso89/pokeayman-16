
import React from "react";

const PokemonDecorations: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-around pointer-events-none">
      <img 
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png" 
        alt="Snorlax" 
        className="h-28 w-auto" 
      />
      <img 
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png" 
        alt="Jigglypuff" 
        className="h-20 w-auto animate-bounce" 
        style={{ animationDuration: "3s" }}
      />
      <img 
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png" 
        alt="Magikarp" 
        className="h-24 w-auto animate-bounce" 
        style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
      />
    </div>
  );
};

export default PokemonDecorations;
