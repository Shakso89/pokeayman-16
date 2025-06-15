
-- This migration rebuilds the Pokémon system to be school-based.
-- WARNING: This will delete all existing data in pokemon_pools and pokemon_collections.

-- Step 1: Create a central catalog for all Pokémon as a single source of truth.
DROP TABLE IF EXISTS public.pokemon_catalog CASCADE;
CREATE TABLE public.pokemon_catalog (
  id INTEGER PRIMARY KEY, -- Using the official Pokedex number
  name TEXT NOT NULL UNIQUE,
  image TEXT,
  type TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'legendary')),
  power_stats JSONB
);

-- RLS for the catalog: Allow all users to read it.
ALTER TABLE public.pokemon_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to pokemon catalog" ON public.pokemon_catalog FOR SELECT USING (true);

-- Step 2: Populate the catalog with a few sample Pokémon.
INSERT INTO public.pokemon_catalog (id, name, image, type, rarity, power_stats) VALUES
(1, 'Bulbasaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', 'Grass/Poison', 'uncommon', '{"hp": 45, "attack": 49, "defense": 49}'),
(4, 'Charmander', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', 'Fire', 'uncommon', '{"hp": 39, "attack": 52, "defense": 43}'),
(7, 'Squirtle', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', 'Water', 'uncommon', '{"hp": 44, "attack": 48, "defense": 65}'),
(25, 'Pikachu', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', 'Electric', 'rare', '{"hp": 35, "attack": 55, "defense": 40}'),
(150, 'Mewtwo', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', 'Psychic', 'legendary', '{"hp": 106, "attack": 110, "defense": 90}');

-- Step 3: Drop the old tables.
DROP TABLE IF EXISTS public.pokemon_pools;
DROP TABLE IF EXISTS public.pokemon_collections;

-- Step 4: Create the new school-based pokemon_pools table. Each row is a unique instance of a Pokemon.
CREATE TABLE public.pokemon_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL REFERENCES public.pokemon_catalog(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned')),
  assigned_to_student_id UUID REFERENCES public.student_profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ
);

-- RLS for pools: Allow authenticated users to view all pools. Management is handled by backend logic.
ALTER TABLE public.pokemon_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to see school pools" ON public.pokemon_pools FOR SELECT TO authenticated USING (true);


-- Step 5: Create the new pokemon_collections table for students.
CREATE TABLE public.pokemon_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL REFERENCES public.pokemon_catalog(id) ON DELETE CASCADE,
  pool_entry_id UUID NOT NULL REFERENCES public.pokemon_pools(id) ON DELETE CASCADE,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for collections: Students can see their own Pokémon.
ALTER TABLE public.pokemon_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can see their own pokemon" ON public.pokemon_collections FOR SELECT USING (EXISTS (SELECT 1 FROM public.student_profiles WHERE id = student_id AND user_id = auth.uid()));


-- Step 6: Add indexes for better performance.
CREATE INDEX idx_pokemon_pools_school_id_status ON public.pokemon_pools(school_id, status);
CREATE INDEX idx_pokemon_collections_student_id ON public.pokemon_collections(student_id);

