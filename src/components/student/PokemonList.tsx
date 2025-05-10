
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface PokemonListProps {
  pokemons: Pokemon[];
  onRemovePokemon: (pokemon: Pokemon) => void;
  showRemoveButton?: boolean;
}

const PokemonList: React.FC<PokemonListProps> = ({ 
  pokemons, 
  onRemovePokemon,
  showRemoveButton = true
}) => {
  const { t } = useTranslation();

  if (pokemons.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("no-pokemon-yet")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {pokemons.map((pokemon) => (
        <div key={pokemon.id} className="bg-white rounded-lg p-4 shadow-sm text-center relative group">
          <img 
            src={pokemon.image || "/placeholder.svg"} 
            alt={pokemon.name} 
            className="w-24 h-24 mx-auto object-contain" 
          />
          <p className="mt-2 font-medium">{pokemon.name}</p>
          <p className="text-sm text-gray-500">{pokemon.type}</p>
          <p className="text-xs text-gray-500 capitalize">{pokemon.rarity}</p>
          
          {showRemoveButton && (
            <button 
              className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemovePokemon(pokemon)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default PokemonList;
