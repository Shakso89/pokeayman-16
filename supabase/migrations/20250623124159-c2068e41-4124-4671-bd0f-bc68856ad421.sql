
-- Drop existing pokemon-related tables to rebuild with unified system
DROP TABLE IF EXISTS public.pokemon_collections CASCADE;
DROP TABLE IF EXISTS public.pokemon_pools CASCADE;
DROP TABLE IF EXISTS public.pokemon_catalog CASCADE;

-- Create unified pokemon pool table
CREATE TABLE public.pokemon_pool (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'legendary')),
  type_1 TEXT NOT NULL,
  type_2 TEXT,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 15,
  power_stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student pokemon collection table
CREATE TABLE public.student_pokemon_collection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  pokemon_id UUID NOT NULL REFERENCES public.pokemon_pool(id) ON DELETE CASCADE,
  awarded_by UUID,
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'mystery_ball' -- 'mystery_ball', 'teacher_award', 'shop_purchase'
);

-- Add RLS policies
ALTER TABLE public.pokemon_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_pokemon_collection ENABLE ROW LEVEL SECURITY;

-- Pokemon pool is viewable by everyone (for shop/reference)
CREATE POLICY "Allow public read access to pokemon pool" 
ON public.pokemon_pool FOR SELECT USING (true);

-- Only authenticated users can manage pokemon pool
CREATE POLICY "Allow authenticated users to manage pokemon pool" 
ON public.pokemon_pool FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Students can view their own collections, teachers can view all
CREATE POLICY "Students can view their own pokemon" 
ON public.student_pokemon_collection FOR SELECT 
USING (true);

-- Allow authenticated users to manage collections
CREATE POLICY "Allow authenticated users to manage collections" 
ON public.student_pokemon_collection FOR ALL TO authenticated 
USING (true) WITH CHECK (true);

-- Populate pokemon pool with sample data
INSERT INTO public.pokemon_pool (name, image_url, rarity, type_1, type_2, description, price, power_stats) VALUES
('Bulbasaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', 'uncommon', 'Grass', 'Poison', 'A seed Pokémon with a bulb on its back', 30, '{"hp": 45, "attack": 49, "defense": 49}'),
('Charmander', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', 'uncommon', 'Fire', null, 'A fire lizard Pokémon with a flame on its tail', 30, '{"hp": 39, "attack": 52, "defense": 43}'),
('Squirtle', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', 'uncommon', 'Water', null, 'A tiny turtle Pokémon that withdraws into its shell', 30, '{"hp": 44, "attack": 48, "defense": 65}'),
('Pikachu', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', 'rare', 'Electric', null, 'An electric mouse Pokémon that stores electricity in its cheeks', 50, '{"hp": 35, "attack": 55, "defense": 40}'),
('Mewtwo', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', 'legendary', 'Psychic', null, 'A legendary psychic Pokémon created through genetic manipulation', 100, '{"hp": 106, "attack": 110, "defense": 90}'),
('Caterpie', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png', 'common', 'Bug', null, 'A small worm Pokémon that evolves quickly', 15, '{"hp": 45, "attack": 30, "defense": 35}'),
('Pidgey', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png', 'common', 'Normal', 'Flying', 'A small bird Pokémon with keen eyesight', 15, '{"hp": 40, "attack": 45, "defense": 40}'),
('Rattata', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png', 'common', 'Normal', null, 'A mouse Pokémon with large front teeth', 15, '{"hp": 30, "attack": 56, "defense": 35}');

-- Add indexes for better performance
CREATE INDEX idx_student_pokemon_collection_student_id ON public.student_pokemon_collection(student_id);
CREATE INDEX idx_student_pokemon_collection_pokemon_id ON public.student_pokemon_collection(pokemon_id);
CREATE INDEX idx_pokemon_pool_rarity ON public.pokemon_pool(rarity);
