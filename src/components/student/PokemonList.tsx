
import React from "react";
import { CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface PokemonListProps {
  pokemons: Pokemon[];
  onRemovePokemon?: (pokemon: Pokemon) => void;
  onPokemonClick?: (pokemon: Pokemon) => void;
  isTeacherView?: boolean;
}

const PokemonList: React.FC<PokemonListProps> = ({ 
  pokemons, 
  onRemovePokemon,
  onPokemonClick,
  isTeacherView = false
}) => {
  const { t } = useTranslation();
  
  if (!pokemons || pokemons.length === 0) {
    return (
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-500">{t("no-pokemon-yet")}</p>
          <CardDescription className="mt-2">
            {t("no-pokemon-description")}
          </CardDescription>
        </div>
      </CardContent>
    );
  }
  
  return (
    <CardContent>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pokemons.map((pokemon) => (
          <div 
            key={pokemon.id}
            className="pokemon-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onPokemonClick?.(pokemon)}
          >
            <div className="relative aspect-square p-4 flex items-center justify-center bg-gray-50">
              <img 
                src={pokemon.image} 
                alt={pokemon.name}
                className="max-h-full object-contain" 
              />
            </div>
            
            <div className="p-3">
              <h3 className="font-medium text-center">{pokemon.name}</h3>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{pokemon.type}</span>
                <span>{pokemon.rarity}</span>
              </div>
              
              {isTeacherView && onRemovePokemon && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePokemon(pokemon);
                  }}
                >
                  {t("remove")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  );
};

export default PokemonList;
