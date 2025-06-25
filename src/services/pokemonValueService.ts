
import { supabase } from "@/integrations/supabase/client";

export interface PokemonValue {
  id: string;
  name: string;
  rarity: string;
  baseValue: number;
  multiplier: number;
}

// Pokemon value system based on rarity
export const RARITY_VALUES = {
  common: { baseValue: 10, multiplier: 1 },
  uncommon: { baseValue: 25, multiplier: 1.5 },
  rare: { baseValue: 50, multiplier: 2 },
  legendary: { baseValue: 100, multiplier: 3 }
} as const;

export const calculatePokemonValue = (rarity: string): number => {
  const rarityKey = rarity.toLowerCase() as keyof typeof RARITY_VALUES;
  const values = RARITY_VALUES[rarityKey] || RARITY_VALUES.common;
  return values.baseValue * values.multiplier;
};

export const getPokemonValues = async (): Promise<PokemonValue[]> => {
  try {
    const { data: pokemon, error } = await supabase
      .from('pokemon_pool')
      .select('id, name, rarity, price');

    if (error) {
      console.error('Error fetching pokemon values:', error);
      return [];
    }

    return (pokemon || []).map(p => ({
      id: p.id,
      name: p.name,
      rarity: p.rarity,
      baseValue: p.price || calculatePokemonValue(p.rarity),
      multiplier: RARITY_VALUES[p.rarity.toLowerCase() as keyof typeof RARITY_VALUES]?.multiplier || 1
    }));
  } catch (error) {
    console.error('Error in getPokemonValues:', error);
    return [];
  }
};
