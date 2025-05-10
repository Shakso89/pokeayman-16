
import React from "react";
import { Pokemon } from "@/types/pokemon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

interface PokemonSelectListProps {
  pokemons: Pokemon[];
  selectedPokemonId: string | null;
  onSelectPokemon: (pokemonId: string) => void;
  label?: string;
  placeholder?: string;
}

const PokemonSelectList: React.FC<PokemonSelectListProps> = ({
  pokemons,
  selectedPokemonId,
  onSelectPokemon,
  label = "Select Pokémon",
  placeholder = "Choose a Pokémon"
}) => {
  const { t } = useTranslation();

  // Don't render the component if there are no pokemons
  if (pokemons.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">{t("no-available-pokemon")}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select 
        value={selectedPokemonId || undefined}
        onValueChange={onSelectPokemon}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {pokemons.map((pokemon) => (
              <SelectItem key={pokemon.id} value={pokemon.id}>
                <div className="flex items-center">
                  <span className="mr-2">{pokemon.name}</span>
                  <span className="text-xs text-gray-500">({pokemon.type})</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PokemonSelectList;
