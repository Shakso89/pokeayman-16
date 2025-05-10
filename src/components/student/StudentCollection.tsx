
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Pokemon } from "@/types/pokemon";

interface StudentCollectionProps {
  pokemons: Pokemon[];
}

const StudentCollection: React.FC<StudentCollectionProps> = ({ pokemons }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {pokemons.length > 0 ? (
        pokemons.map(pokemon => (
          <Card key={pokemon.id} className="pokemon-card overflow-visible">
            <div className="relative w-full">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <img 
                  src={pokemon.image} 
                  alt={pokemon.name} 
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>
            <CardContent className="pt-10 pb-4 text-center">
              <h3 className="font-bold text-lg">{pokemon.name}</h3>
              <p className="text-sm text-gray-500">{pokemon.type}</p>
              <p className="mt-1">
                <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${
                  pokemon.rarity === 'legendary' ? 'bg-yellow-500' :
                  pokemon.rarity === 'rare' ? 'bg-purple-500' :
                  pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {pokemon.rarity}
                </span>
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="col-span-full border-dashed">
          <CardContent className="p-8 text-center">
            <PlusCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Pokémon Yet</h3>
            <p className="text-gray-500">Use the Pokémon Wheel to get your first Pokémon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentCollection;
