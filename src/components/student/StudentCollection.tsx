
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Star } from "lucide-react";
import { Pokemon } from "@/types/pokemon";

interface StudentCollectionProps {
  pokemons: Pokemon[];
}

const StudentCollection: React.FC<StudentCollectionProps> = ({ pokemons }) => {
  return (
    <div className="relative">
      {/* Logo in the top center of collection */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 z-10">
        <img
          src="/lovable-uploads/b11bcb27-9dd4-43ab-8112-ea075303ce55.png"
          alt="PokéAyman"
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-8">
        {pokemons.length > 0 ? (
          pokemons.map(pokemon => (
            <Card key={pokemon.id} className="overflow-visible transform transition-transform hover:scale-105">
              <div className="relative w-full">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <img 
                    src={pokemon.image} 
                    alt={pokemon.name} 
                    className="w-14 h-14 object-contain"
                  />
                </div>
                
                {/* Rarity indicator */}
                <div className="absolute top-2 right-2">
                  {pokemon.rarity === 'legendary' && (
                    <div className="flex gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                  {pokemon.rarity === 'rare' && (
                    <div className="flex gap-1">
                      <Star className="h-4 w-4 text-purple-500 fill-purple-500" />
                      <Star className="h-4 w-4 text-purple-500 fill-purple-500" />
                    </div>
                  )}
                  {pokemon.rarity === 'uncommon' && (
                    <div className="flex">
                      <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                    </div>
                  )}
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
              <h3 className="text-lg font-medium mb-2">No Pokémon yet!</h3>
              <p className="text-gray-500">Use the Mystery Ball to get your first Pokémon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentCollection;
