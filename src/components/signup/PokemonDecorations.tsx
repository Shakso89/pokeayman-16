
import React from "react";

const PokemonDecorations: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none">
      {/* Actual Pokémon images */}
      <div className="flex justify-around items-end">
        <img 
          src="/lovable-uploads/d1c806ec-9607-4d94-af2a-bdbb8d2cb0c6.png" 
          alt="Bulbasaur" 
          className="h-28 w-auto opacity-90" 
        />
        <img 
          src="/lovable-uploads/2c72122a-ed62-4276-b90f-0f0688bf9693.png" 
          alt="Charizard" 
          className="h-36 w-auto opacity-90" 
        />
        <img 
          src="/lovable-uploads/6b6ad061-baa5-438e-a631-131fbfe0eafc.png" 
          alt="Pikachu" 
          className="h-32 w-auto opacity-90" 
        />
        <img 
          src="/lovable-uploads/910a066a-fa23-46db-8b02-8962e4a69514.png" 
          alt="Golem" 
          className="h-28 w-auto opacity-90" 
        />
        <img 
          src="/lovable-uploads/1e55a3bb-e08c-4e4d-88e3-6f7cdf782ab2.png" 
          alt="Glalie" 
          className="h-32 w-auto opacity-90" 
        />
        <img 
          src="/lovable-uploads/a7c208ad-3516-428f-880d-4f280eef1724.png" 
          alt="Gengar" 
          className="h-28 w-auto opacity-90" 
        />
      </div>
      
      {/* Gradient overlay for better blending */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent"></div>
    </div>
  );
};

export default PokemonDecorations;
