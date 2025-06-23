
export interface Pokemon {
  id: string;
  name: string;
  image_url: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  type_1: string;
  type_2?: string;
  description?: string;
  price: number;
  power_stats?: {
    hp?: number;
    attack?: number;
    defense?: number;
  };
  created_at?: string;
}

export interface StudentPokemonCollection {
  id: string;
  student_id: string;
  pokemon_id: string;
  awarded_by?: string;
  awarded_at: string;
  source: 'mystery_ball' | 'teacher_award' | 'shop_purchase';
  pokemon?: Pokemon;
}

export interface SchoolPoolPokemon extends Pokemon {
  poolEntryId?: string;
}
