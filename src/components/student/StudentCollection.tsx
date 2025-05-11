
import React from "react";
import { Pokemon } from "@/types/pokemon";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PokemonList from "./PokemonList";

interface StudentCollectionProps {
  pokemons: Pokemon[];
}

const StudentCollection: React.FC<StudentCollectionProps> = ({ pokemons }) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <CardTitle>My Pokémons</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <PokemonList pokemons={pokemons} />
      </CardContent>
    </Card>
  );
};

export default StudentCollection;
