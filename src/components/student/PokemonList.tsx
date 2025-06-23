
import React, { useState } from "react";
import { Pokemon } from "@/types/pokemon";
import { Card, CardContent } from "@/components/ui/card";
import PokemonDetailDialog from "@/components/pokemon/PokemonDetailDialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PokemonListProps {
  pokemons: Pokemon[];
  onPokemonClick?: (pokemon: Pokemon) => void;
  onRemovePokemon?: (pokemon: Pokemon) => void;
  isTeacherView?: boolean;
}

const PokemonList: React.FC<PokemonListProps> = ({ 
  pokemons,
  onPokemonClick,
  onRemovePokemon,
  isTeacherView
}) => {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePokemonClick = (pokemon: Pokemon) => {
    if (onPokemonClick) {
      onPokemonClick(pokemon);
    } else {
      setSelectedPokemon(pokemon);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pokemons.length > 0 ? (
          pokemons.map((pokemon) => (
            <Card 
              key={pokemon.id} 
              className="cursor-pointer hover:shadow-md transition-shadow relative"
            >
              {isTeacherView && onRemovePokemon && (
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-1 right-1 h-6 w-6 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePokemon(pokemon);
                  }}
                >
                  <X size={12} />
                </Button>
              )}
              <CardContent 
                className="p-4"
                onClick={() => handlePokemonClick(pokemon)}
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 mb-2">
                    <img
                      src={pokemon.image_url}
                      alt={pokemon.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-center">{pokemon.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {pokemon.type_1}
                    </span>
                    {pokemon.type_2 && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {pokemon.type_2}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        pokemon.rarity === "legendary"
                          ? "bg-yellow-100 text-yellow-800"
                          : pokemon.rarity === "rare"
                          ? "bg-purple-100 text-purple-800"
                          : pokemon.rarity === "uncommon"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {pokemon.rarity}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No Pokémon yet.
          </div>
        )}
      </div>

      <PokemonDetailDialog
        pokemon={selectedPokemon}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default PokemonList;
