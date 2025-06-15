
import React from "react";
import { Award } from "lucide-react";

interface Pokemon {
  id: number; // Changed from string to number to match database
  name: string;
  image: string;
  type?: string;
  rarity?: string;
  power?: number;
  level?: number;
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
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {pokemons.map((p) => (
        <div
          key={p.id}
          className="rounded-lg border bg-white p-3 shadow flex flex-col items-center text-center"
        >
          <img
            className="w-24 h-24 object-contain mb-1"
            src={p.image}
            alt={p.name}
          />
          <div className="text-lg font-semibold">
            {p.name}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {p.type} &bull; {p.rarity}
          </div>
          {(p.power || p.level) && (
            <div className="text-gray-800 text-sm">
              {p.power && <>Power: {p.power}</>}
              {p.level && <>Level: {p.level}</>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentProfilePokemonList;
