
import React from "react";
import { Award } from "lucide-react";

interface Pokemon {
  id: number;
  name: string;
  image: string;
  type?: string;
  rarity?: string;
  power?: number;
  level?: number;
  powerStats?: Record<string, number>;
}

interface StudentProfilePokemonListProps {
  pokemons: Pokemon[];
}

const StudentProfilePokemonList: React.FC<StudentProfilePokemonListProps> = ({ pokemons }) => {
  if (!pokemons.length) {
    return (
      <div className="text-gray-400 text-center p-6">
        No Pokémon collected yet.
      </div>
    );
  }

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'text-purple-600 bg-purple-100';
      case 'rare':
        return 'text-blue-600 bg-blue-100';
      case 'uncommon':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'fire':
        return 'text-red-600';
      case 'water':
        return 'text-blue-600';
      case 'grass':
        return 'text-green-600';
      case 'electric':
        return 'text-yellow-600';
      case 'psychic':
        return 'text-purple-600';
      case 'ice':
        return 'text-cyan-600';
      case 'dragon':
        return 'text-indigo-600';
      case 'dark':
        return 'text-gray-800';
      case 'fairy':
        return 'text-pink-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {pokemons.map((pokemon) => (
        <div
          key={`${pokemon.id}-${Math.random()}`}
          className="rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 mb-2 flex items-center justify-center bg-gray-50 rounded-lg">
            {pokemon.image ? (
              <img
                className="w-full h-full object-contain"
                src={pokemon.image}
                alt={pokemon.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Award className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          <div className="text-sm font-semibold text-gray-800 mb-1">
            {pokemon.name}
          </div>
          
          <div className="flex flex-col gap-1 w-full">
            {pokemon.type && (
              <div className={`text-xs font-medium ${getTypeColor(pokemon.type)}`}>
                {pokemon.type.charAt(0).toUpperCase() + pokemon.type.slice(1)}
              </div>
            )}
            
            {pokemon.rarity && (
              <div className={`text-xs px-2 py-1 rounded-full ${getRarityColor(pokemon.rarity)}`}>
                {pokemon.rarity.charAt(0).toUpperCase() + pokemon.rarity.slice(1)}
              </div>
            )}
            
            {(pokemon.power || pokemon.level || pokemon.powerStats) && (
              <div className="text-xs text-gray-600 mt-1">
                {pokemon.power && <div>Power: {pokemon.power}</div>}
                {pokemon.level && <div>Level: {pokemon.level}</div>}
                {pokemon.powerStats && Object.keys(pokemon.powerStats).length > 0 && (
                  <div>Stats: {Object.values(pokemon.powerStats).reduce((a, b) => a + b, 0)}</div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentProfilePokemonList;
