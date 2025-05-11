
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Pokemon } from "@/types/pokemon";

interface SchoolPokemonPoolTabProps {
  schoolPokemons: Pokemon[];
}

const SchoolPokemonPoolTab: React.FC<SchoolPokemonPoolTabProps> = ({ schoolPokemons }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">{t("school-pokemon-pool")}</h2>
      <p className="text-center mb-6 text-gray-600">{t("available-pokemon")}: {schoolPokemons.length}</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
        {schoolPokemons.map(pokemon => (
          <div key={pokemon.id} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            <img src={pokemon.image} alt={pokemon.name} className="w-full h-24 object-contain mx-auto" />
            <div className="mt-2 text-center">
              <p className="font-medium text-sm">{pokemon.name}</p>
              <p className="text-xs text-gray-500">{pokemon.type}</p>
              <span className={`inline-block px-2 py-0.5 mt-1 rounded-full text-xs text-white ${pokemon.rarity === 'legendary' ? 'bg-yellow-500' : pokemon.rarity === 'rare' ? 'bg-purple-500' : pokemon.rarity === 'uncommon' ? 'bg-blue-500' : 'bg-green-500'}`}>
                {pokemon.rarity}
              </span>
            </div>
          </div>
        ))}
        
        {schoolPokemons.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t("no-pokemon-available")}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolPokemonPoolTab;
