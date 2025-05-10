
import { Pokemon, PokemonPool, StudentPokemon } from "@/types/pokemon";

// Helper functions for generating random Pokemon data
export const getRandomType = () => {
  const types = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting",
    "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost",
    "Dragon", "Dark", "Steel", "Fairy"
  ];
  
  // Occasionally generate dual types
  if (Math.random() > 0.7) {
    const type1 = types[Math.floor(Math.random() * types.length)];
    let type2;
    do {
      type2 = types[Math.floor(Math.random() * types.length)];
    } while (type1 === type2);
    
    return `${type1}/${type2}`;
  }
  
  return types[Math.floor(Math.random() * types.length)];
};

export const getRarityForId = (id: number): "common" | "uncommon" | "rare" | "legendary" => {
  // Legendary Pokemon are rare (1%)
  if (id % 100 === 0 || id % 50 === 0) {
    return "legendary";
  }
  
  // Rare Pokemon (10%)
  if (id % 10 === 0 || id % 25 === 0) {
    return "rare";
  }
  
  // Uncommon Pokemon (30%)
  if (id % 3 === 0) {
    return "uncommon";
  }
  
  // Common Pokemon (59%)
  return "common";
};
