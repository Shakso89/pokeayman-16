
export interface Pokemon {
  id: string;
  name: string;
  image: string;
  type: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

export interface PokemonPool {
  classId: string;
  availablePokemons: Pokemon[];
}

export interface StudentPokemon {
  studentId: string;
  pokemons: Pokemon[];
  coins: number;
}
