
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Pokemon } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface StudentCollectionProps {
  pokemons: Pokemon[];
}

const StudentCollection: React.FC<StudentCollectionProps> = ({ pokemons }) => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{t('my-collection')}</h2>
      
      {pokemons.length === 0 ? (
        <div className="text-center py-8">
          <img 
            src="/lovable-uploads/8146eac3-4188-4a43-a598-3d019d079462.png"
            alt="Empty Collection" 
            className="mx-auto h-32 w-auto mb-4 opacity-70"
          />
          <p className="text-gray-500">{t('no-pokemons-yet')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('use-mystery-ball')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pokemons.map((pokemon) => (
            <Card key={pokemon.id} className="pokemon-card overflow-hidden hover:shadow-xl transition-all">
              <CardContent className="p-4 flex flex-col items-center">
                <img 
                  src={pokemon.image} 
                  alt={pokemon.name} 
                  className="w-32 h-32 object-contain my-4"
                />
                <div className="text-center">
                  <h3 className="font-bold text-lg">{pokemon.name}</h3>
                  <div className="flex justify-center gap-2 mt-2">
                    <span 
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ 
                        backgroundColor: getPokemonTypeColor(pokemon.type)
                      }}
                    >
                      {pokemon.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">
                    {t('level')}: {1}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to get color based on Pokemon type
function getPokemonTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    fire: '#ff7b45',
    water: '#5090f0',
    grass: '#78c850',
    electric: '#f8d030',
    psychic: '#f85888',
    ice: '#98d8d8',
    dragon: '#7038f8',
    dark: '#705848',
    fairy: '#ee99ac',
    normal: '#a8a878',
    fighting: '#c03028',
    flying: '#a890f0',
    poison: '#a040a0',
    ground: '#e0c068',
    rock: '#b8a038',
    bug: '#a8b820',
    ghost: '#705898',
    steel: '#b8b8d0',
    default: '#777777'
  };

  return typeColors[type.toLowerCase()] || typeColors.default;
}

export default StudentCollection;
